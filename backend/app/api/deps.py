from fastapi import Depends, HTTPException, status

def get_current_user():
    # nanti diganti pakai JWT
    return {"id": 1, "role": "user"}