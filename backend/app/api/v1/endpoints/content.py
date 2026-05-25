from sqlalchemy import func
from sqlalchemy.orm import Session

from fastapi import APIRouter
from fastapi import Depends

from app.api.v1.deps import (
    get_current_user,
)

from app.db.session import get_db

from app.models.action import Action
from app.models.content import Content
from app.models.prediction import Prediction
from app.models.user import User

from app.schemas.content_schema import (
    ContentResponse,
)

router = APIRouter()


@router.get(
    "/",
    response_model=list[ContentResponse],
)
def get_contents(
    type: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    query = db.query(Content)

    # FILTER TYPE
    if type:
        query = query.filter(
            Content.type == type
        )

    contents = query.all()

    results = []

    for item in contents:

        current_progress = 0
        completed = False

        # ONLY FOR CHALLENGE
        if item.type == "challenge":

            # SCAN
            if (
                item.challenge_type
                == "scan"
            ):

                current_progress = (
                    db.query(
                        func.count(
                            Prediction.id
                        )
                    )
                    .filter(
                        Prediction.user_id
                        == current_user.id
                    )
                    .scalar()
                )

            # ACTION
            elif (
                item.challenge_type
                == "action"
            ):

                current_progress = (
                    db.query(
                        func.count(
                            Action.id
                        )
                    )
                    .filter(
                        Action.user_id
                        == current_user.id
                    )
                    .scalar()
                )

            # POINTS
            elif (
                item.challenge_type
                == "points"
            ):

                current_progress = (
                    current_user.total_points
                )

            completed = (
                current_progress
                >= (item.target or 0)
            )

        results.append(
            {
                "id": item.id,
                "title": item.title,
                "description": item.description,
                "type": item.type,
                "status": item.status,
                "challenge_type":
                    item.challenge_type,
                "target": item.target,
                "reward_points":
                    item.reward_points,
                "created_at":
                    item.created_at,

                # realtime challenge
                "current_progress":
                    current_progress,
                "completed":
                    completed,
            }
        )

    return results