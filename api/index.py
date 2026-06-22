import os
import json
import base64
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import requests

app = FastAPI()

# Enable CORS for local dev cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
DATA_FILE = "fittrack_data.json"
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
GITHUB_REPO = os.environ.get("GITHUB_REPO") # Format: "username/repo"

class SyncPayload(BaseModel):
    settings: Dict[str, Any]
    logs: Dict[str, Any]
    lastModifiedDate: Optional[str] = None

def get_github_headers():
    return {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }

def fetch_from_github():
    if not GITHUB_TOKEN or not GITHUB_REPO:
        return None, None
        
    url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{DATA_FILE}"
    try:
        response = requests.get(url, headers=get_github_headers())
        if response.status_code == 200:
            content_data = response.json()
            sha = content_data.get("sha")
            # GitHub returns base64 content with newline characters, strip them
            content_b64 = content_data.get("content", "").replace("\n", "").replace("\r", "")
            decoded = base64.b64decode(content_b64).decode("utf-8")
            return json.loads(decoded), sha
        elif response.status_code == 404:
            # File doesn't exist yet, return default structure
            return {"settings": {}, "logs": {}}, None
        else:
            raise HTTPException(
                status_code=502, 
                detail=f"GitHub API returned status {response.status_code}: {response.text}"
            )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to read from GitHub: {str(e)}")

def save_to_github(data: dict):
    if not GITHUB_TOKEN or not GITHUB_REPO:
        return False
        
    # We fetch the current file first to get the latest SHA, ensuring we do not get conflict errors
    _, sha = fetch_from_github()
    
    url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{DATA_FILE}"
    
    json_str = json.dumps(data, indent=2)
    b64_content = base64.b64encode(json_str.encode("utf-8")).decode("utf-8")
    
    payload = {
        "message": "Update FitTrack data file [Vercel Sync]",
        "content": b64_content
    }
    if sha:
        payload["sha"] = sha
        
    try:
        response = requests.put(url, headers=get_github_headers(), json=payload)
        if response.status_code not in [200, 201]:
            raise HTTPException(
                status_code=502,
                detail=f"GitHub API update failed ({response.status_code}): {response.text}"
            )
        return True
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to save to GitHub: {str(e)}")

def fetch_sha_from_github(path: str):
    url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{path}"
    try:
        response = requests.get(url, headers=get_github_headers())
        if response.status_code == 200:
            return response.json().get("sha")
        return None
    except Exception:
        return None

def save_day_to_github(date_str: str, day_log: dict):
    path = f"daily_logs/{date_str}.json"
    url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{path}"
    
    sha = fetch_sha_from_github(path)
    
    json_str = json.dumps(day_log, indent=2)
    b64_content = base64.b64encode(json_str.encode("utf-8")).decode("utf-8")
    
    payload = {
        "message": f"Update daily log for {date_str} [Vercel Sync]",
        "content": b64_content
    }
    if sha:
        payload["sha"] = sha
        
    try:
        response = requests.put(url, headers=get_github_headers(), json=payload)
        if response.status_code not in [200, 201]:
            print(f"Failed to save daily log to GitHub: {response.text}")
    except Exception as e:
        print(f"Error saving daily log to GitHub: {str(e)}")

@app.get("/api/data")
def get_data():
    # 1. Try GitHub sync if environment variables are set
    if GITHUB_TOKEN and GITHUB_REPO:
        data, _ = fetch_from_github()
        return data
        
    # 2. Local Fallback
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error reading local data file: {str(e)}")
            
    # Default initial state
    return {"settings": {}, "logs": {}}

@app.post("/api/data")
def save_data(payload: SyncPayload):
    data = {
        "settings": payload.settings,
        "logs": payload.logs
    }
    
    # 1. Try GitHub Sync
    if GITHUB_TOKEN and GITHUB_REPO:
        save_to_github(data)
        if payload.lastModifiedDate and payload.lastModifiedDate in payload.logs:
            day_log = payload.logs[payload.lastModifiedDate]
            save_day_to_github(payload.lastModifiedDate, day_log)
        return {"status": "success", "storage": "github"}
        
    # 2. Local Fallback
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        if payload.lastModifiedDate and payload.lastModifiedDate in payload.logs:
            day_log = payload.logs[payload.lastModifiedDate]
            os.makedirs("daily_logs", exist_ok=True)
            daily_file = os.path.join("daily_logs", f"{payload.lastModifiedDate}.json")
            with open(daily_file, "w", encoding="utf-8") as f:
                json.dump(day_log, f, indent=2, ensure_ascii=False)
                
        return {"status": "success", "storage": "local"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error writing local data file: {str(e)}")

# Mount static files and routes for local development hosting
@app.get("/")
def read_root():
    if os.path.exists("index.html"):
        return FileResponse("index.html")
    return {"status": "FitTrack API Server is running."}

# Service worker and manifest routes at root
@app.get("/manifest.json")
def read_manifest():
    if os.path.exists("manifest.json"):
        return FileResponse("manifest.json")
    raise HTTPException(status_code=404)

@app.get("/sw.js")
def read_sw():
    if os.path.exists("sw.js"):
        return FileResponse("sw.js")
    raise HTTPException(status_code=404)

# Mount directories if they exist locally
for folder in ["css", "js", "icons"]:
    if os.path.exists(folder):
        app.mount(f"/{folder}", StaticFiles(directory=folder), name=folder)
