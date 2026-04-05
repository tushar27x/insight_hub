from datetime import datetime
from typing import Optional, Dict, Any
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON

class UserInsights(SQLModel, table=True):
    """
    The Index table to track users and their last update time.
    """
    __tablename__ = "user_insights"
    
    user_id: int = Field(primary_key=True)  # GitHub ID
    user_name: str = Field(index=True)      # GitHub Login
    archetype: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # One-to-one relationship with the template data
    template: Optional["UserTemplates"] = Relationship(back_populates="user")

class UserTemplates(SQLModel, table=True):
    """
    The Content table storing the heavy JSON data for the UI.
    """
    __tablename__ = "user_templates"
    
    user_id: int = Field(primary_key=True, foreign_key="user_insights.user_id")
    # Using sa_column to explicitly declare JSON type for Postgres compatibility
    stats_json: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    display_json: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    version: str = Field(default="v1")
    
    user: Optional[UserInsights] = Relationship(back_populates="template")
