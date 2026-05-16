def award_badge(user_id: int, badge_name: str) -> dict:
    return {"user_id": user_id, "badge": badge_name, "awarded": True}