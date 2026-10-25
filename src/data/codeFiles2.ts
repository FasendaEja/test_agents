import type { CodeModule } from './codeFiles';

export const projectModulesPart2: CodeModule[] = [
  {
    name: 'База данных',
    icon: '🗄️',
    description: 'SQLAlchemy модели, сессии, репозиторий, миграции',
    files: [
      {
        path: 'db/__init__.py',
        language: 'python',
        description: 'Модуль базы данных',
        code: `"""Модуль базы данных."""
from db.session import get_engine, get_session, init_db
from db.repository import Repository

__all__ = ["get_engine", "get_session", "init_db", "Repository"]`,
      },
      {
        path: 'db/models.py',
        language: 'python',
        description: 'SQLAlchemy модели',
        code: `"""SQLAlchemy модели."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, Enum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Базовый класс моделей."""
    pass


class RunModel(Base):
    """Модель запуска."""
    __tablename__ = "runs"

    run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    status: Mapped[str] = mapped_column(String(32), default="running")
    current_stage: Mapped[str] = mapped_column(String(64), default="intake_requirements")
    config_json: Mapped[dict] = mapped_column("config", JSON, default=dict)

    stages: Mapped[list["StageStateModel"]] = relationship(back_populates="run", cascade="all, delete-orphan")
    reviews: Mapped[list["HumanReviewModel"]] = relationship(back_populates="run", cascade="all, delete-orphan")


class StageStateModel(Base):
    """Модель состояния этапа."""
    __tablename__ = "stage_states"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("runs.run_id"))
    stage: Mapped[str] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(32), default="pending")
    iteration: Mapped[int] = mapped_column(Integer, default=0)
    max_iterations: Mapped[int] = mapped_column(Integer, default=5)
    result_path: Mapped[str | None] = mapped_column(String(512))
    rationale_path: Mapped[str | None] = mapped_column(String(512))
    error: Mapped[str | None] = mapped_column(Text)

    run: Mapped["RunModel"] = relationship(back_populates="stages")


class HumanReviewModel(Base):
    """Модель решения человека."""
    __tablename__ = "human_reviews"

    review_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("runs.run_id"))
    stage: Mapped[str] = mapped_column(String(64))
    iteration: Mapped[int] = mapped_column(Integer)
    decision: Mapped[str] = mapped_column(String(32))
    comment: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    run: Mapped["RunModel"] = relationship(back_populates="reviews")


class RequirementVersionModel(Base):
    """Модель версии требований."""
    __tablename__ = "requirement_versions"

    version_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("runs.run_id"))
    type: Mapped[str] = mapped_column(String(16))  # current | baseline
    content: Mapped[str] = mapped_column(Text)
    sources_json: Mapped[list] = mapped_column("sources", JSON, default=list)
    metadata_json: Mapped[dict] = mapped_column("metadata", JSON, default=dict)`,
      },
      {
        path: 'db/session.py',
        language: 'python',
        description: 'Сессии и подключение к БД',
        code: `"""Сессии и подключение к БД."""
from __future__ import annotations

from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from config import get_settings
from db.models import Base

_engine: Engine | None = None
_SessionLocal: sessionmaker | None = None


def get_engine() -> Engine:
    """Получить engine."""
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_engine(
            settings.database.database_url,
            echo=settings.database.echo,
            pool_size=settings.database.pool_size,
            max_overflow=settings.database.max_overflow,
            pool_timeout=settings.database.pool_timeout,
        )
    return _engine


def get_session_factory() -> sessionmaker:
    """Получить фабрику сессий."""
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(bind=get_engine(), expire_on_commit=False)
    return _SessionLocal


@contextmanager
def get_session() -> Generator[Session, None, None]:
    """Контекстный менеджер сессии."""
    factory = get_session_factory()
    session = factory()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def init_db() -> None:
    """Инициализировать БД (создать таблицы)."""
    engine = get_engine()
    Base.metadata.create_all(engine)`,
      },
      {
        path: 'db/repository.py',
        language: 'python',
        description: 'Репозиторий данных',
        code: `"""Репозиторий данных."""
from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from db.models import (
    HumanReviewModel,
    RequirementVersionModel,
    RunModel,
    StageStateModel,
)
from schemas.human_review import HumanReview
from schemas.requirement_version import RequirementVersion
from schemas.run import Run
from schemas.stage_state import StageState


class Repository:
    """Репозиторий для работы с БД."""

    def __init__(self, session: Session) -> None:
        self.session = session

    # === Run ===

    def create_run(self, run: Run) -> Run:
        """Создать запуск."""
        model = RunModel(
            run_id=run.run_id,
            status=run.status.value,
            current_stage=run.current_stage,
            config_json=run.config,
        )
        self.session.add(model)
        self.session.flush()
        return run

    def get_run(self, run_id: uuid.UUID) -> Run | None:
        """Получить запуск."""
        model = self.session.get(RunModel, run_id)
        if model is None:
            return None
        return Run(
            run_id=model.run_id,
            created_at=model.created_at,
            updated_at=model.updated_at,
            status=model.status,
            current_stage=model.current_stage,
            config=model.config_json,
        )

    def list_runs(self, limit: int = 50) -> list[Run]:
        """Список запусков."""
        stmt = select(RunModel).order_by(RunModel.created_at.desc()).limit(limit)
        models = self.session.execute(stmt).scalars().all()
        return [
            Run(
                run_id=m.run_id,
                created_at=m.created_at,
                updated_at=m.updated_at,
                status=m.status,
                current_stage=m.current_stage,
                config=m.config_json,
            )
            for m in models
        ]

    def update_run_status(self, run_id: uuid.UUID, status: str, current_stage: str | None = None) -> None:
        """Обновить статус запуска."""
        model = self.session.get(RunModel, run_id)
        if model:
            model.status = status
            if current_stage:
                model.current_stage = current_stage

    # === StageState ===

    def create_stage_state(self, state: StageState) -> StageState:
        """Создать состояние этапа."""
        model = StageStateModel(
            run_id=state.run_id,
            stage=state.stage,
            status=state.status.value,
            iteration=state.iteration,
            max_iterations=state.max_iterations,
        )
        self.session.add(model)
        self.session.flush()
        return state

    def get_stage_state(self, run_id: uuid.UUID, stage: str) -> StageState | None:
        """Получить состояние этапа."""
        stmt = select(StageStateModel).where(
            StageStateModel.run_id == run_id,
            StageStateModel.stage == stage,
        )
        model = self.session.execute(stmt).scalar_one_or_none()
        if model is None:
            return None
        return StageState(
            run_id=model.run_id,
            stage=model.stage,
            status=model.status,
            iteration=model.iteration,
            max_iterations=model.max_iterations,
            result_path=model.result_path,
            rationale_path=model.rationale_path,
            error=model.error,
        )

    def update_stage_state(self, run_id: uuid.UUID, stage: str, **kwargs) -> None:
        """Обновить состояние этапа."""
        stmt = select(StageStateModel).where(
            StageStateModel.run_id == run_id,
            StageStateModel.stage == stage,
        )
        model = self.session.execute(stmt).scalar_one_or_none()
        if model:
            for key, value in kwargs.items():
                if hasattr(model, key):
                    setattr(model, key, value)

    # === HumanReview ===

    def save_review(self, review: HumanReview) -> HumanReview:
        """Сохранить решение человека."""
        model = HumanReviewModel(
            review_id=review.review_id,
            run_id=review.run_id,
            stage=review.stage,
            iteration=review.iteration,
            decision=review.decision.value,
            comment=review.comment,
        )
        self.session.add(model)
        self.session.flush()
        return review

    def get_reviews(self, run_id: uuid.UUID, stage: str) -> list[HumanReview]:
        """Получить решения по этапу."""
        stmt = (
            select(HumanReviewModel)
            .where(HumanReviewModel.run_id == run_id, HumanReviewModel.stage == stage)
            .order_by(HumanReviewModel.created_at)
        )
        models = self.session.execute(stmt).scalars().all()
        return [
            HumanReview(
                review_id=m.review_id,
                run_id=m.run_id,
                stage=m.stage,
                iteration=m.iteration,
                decision=m.decision,
                comment=m.comment,
                created_at=m.created_at,
            )
            for m in models
        ]

    # === RequirementVersion ===

    def save_requirement_version(self, version: RequirementVersion) -> RequirementVersion:
        """Сохранить версию требований."""
        model = RequirementVersionModel(
            version_id=version.version_id,
            run_id=version.run_id,
            type=version.type,
            content=version.content,
            sources_json=[s.model_dump() for s in version.sources],
            metadata_json=version.metadata,
        )
        self.session.add(model)
        self.session.flush()
        return version

    def get_requirement_version(self, run_id: uuid.UUID, type: str) -> RequirementVersion | None:
        """Получить версию требований."""
        stmt = select(RequirementVersionModel).where(
            RequirementVersionModel.run_id == run_id,
            RequirementVersionModel.type == type,
        )
        model = self.session.execute(stmt).scalar_one_or_none()
        if model is None:
            return None
        from schemas.requirement_version import Source
        return RequirementVersion(
            version_id=model.version_id,
            run_id=model.run_id,
            type=model.type,
            content=model.content,
            sources=[Source(**s) for s in model.sources_json],
            metadata=model.metadata_json,
        )`,
      },
      {
        path: 'db/migrations/env.py',
        language: 'python',
        description: 'Alembic env',
        code: `"""Alembic env."""
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from config import get_settings
from db.models import Base

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

settings = get_settings()
config.set_main_option("sqlalchemy.url", settings.database.database_url)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()`,
      },
    ],
  },
  {
    name: 'LLM клиент',
    icon: '🤖',
    description: 'OpenAI-compatible клиент, промпты, парсинг JSON',
    files: [
      {
        path: 'llm/__init__.py',
        language: 'python',
        description: 'Модуль LLM',
        code: `"""Модуль LLM."""
from llm.client import LLMClient
from llm.json_parser import parse_json_response
from llm.prompts import get_prompt

__all__ = ["LLMClient", "parse_json_response", "get_prompt"]`,
      },
      {
        path: 'llm/client.py',
        language: 'python',
        description: 'OpenAI-compatible клиент',
        code: `"""OpenAI-compatible LLM клиент."""
from __future__ import annotations

import json
import logging
from typing import Type, TypeVar

from openai import OpenAI
from pydantic import BaseModel, ValidationError

from config import get_settings
from llm.json_parser import parse_json_response

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


class LLMClient:
    """Клиент для работы с LLM."""

    def __init__(self) -> None:
        settings = get_settings()
        self.config = settings.llm
        self.client = OpenAI(
            api_key=self.config.api_key,
            base_url=self.config.base_url,
            timeout=self.config.timeout,
            max_retries=0,
        )

    def complete(self, prompt: str, system_prompt: str | None = None) -> str:
        """Получить текстовый ответ от LLM."""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        for attempt in range(1, self.config.max_retries + 1):
            try:
                response = self.client.chat.completions.create(
                    model=self.config.model,
                    messages=messages,
                    temperature=self.config.temperature,
                    max_tokens=self.config.max_tokens,
                )
                return response.choices[0].message.content or ""
            except Exception as e:
                logger.warning(f"Попытка {attempt}/{self.config.max_retries} не удалась: {e}")
                if attempt == self.config.max_retries:
                    raise
        return ""

    def structured_complete(self, prompt: str, schema: Type[T], system_prompt: str | None = None) -> T:
        """Получить структурированный ответ от LLM."""
        for attempt in range(1, self.config.max_retries + 1):
            try:
                raw = self.complete(prompt, system_prompt)
                data = parse_json_response(raw)
                return schema.model_validate(data)
            except (json.JSONDecodeError, ValidationError) as e:
                logger.warning(f"Попытка {attempt}: ошибка валидации: {e}")
                if attempt < self.config.max_retries:
                    prompt = f"{prompt}\\n\\nПредыдущий ответ был невалидным: {e}. Исправь и верни корректный JSON."
                else:
                    raise ValueError(f"Не удалось получить валидный JSON после {self.config.max_retries} попыток: {e}")
        raise ValueError("Не удалось получить ответ от LLM")`,
      },
      {
        path: 'llm/json_parser.py',
        language: 'python',
        description: 'Парсинг JSON из ответа LLM',
        code: `"""Парсинг JSON из ответа LLM."""
from __future__ import annotations

import json
import re


def parse_json_response(text: str) -> dict | list:
    """Извлечь JSON из текста ответа LLM.

    Поддерживает:
    - Чистый JSON
    - JSON в markdown-блоках (\`\`\`json ... \`\`\`)
    - JSON с лишним текстом вокруг
    """
    text = text.strip()

    # Попытка 1: прямой парсинг
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Попытка 2: извлечение из markdown-блока
    patterns = [
        r'\`\`\`json\\s*\\n?(.*?)\\n?\\s*\`\`\`',
        r'\`\`\`\\s*\\n?(.*?)\\n?\\s*\`\`\`',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1).strip())
            except json.JSONDecodeError:
                continue

    # Попытка 3: поиск первой { или [ и последней } или ]
    for start_char, end_char in [('{', '}'), ('[', ']')]:
        start = text.find(start_char)
        end = text.rfind(end_char)
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start : end + 1])
            except json.JSONDecodeError:
                continue

    raise json.JSONDecodeError("Не удалось извлечь JSON из ответа", text, 0)`,
      },
      {
        path: 'llm/prompts.py',
        language: 'python',
        description: 'Шаблоны промптов для агентов',
        code: `"""Шаблоны промптов для агентов."""
from __future__ import annotations

PROMPTS: dict[str, str] = {
    "intake": """Ты — агент для приема и нормализации требований.
Проанализируй следующий текст требований и верни нормализованную версию.
Сохраняй все ключевые детали, структурируй по разделам.
Верни результат в виде структурированного текста.""",

    "diff": """Ты — агент для сравнения двух версий требований.

Сравни baseline и current версии. Для каждого изменения укажи:
- delta_id: уникальный ID
- type: added|changed|removed|unchanged|moved|renamed|unclear
- title: краткое описание
- old_text, new_text
- semantic_change: true/false
- formatting_only: true/false
- impact_areas: список затронутых областей
- rationale: объяснение
- recommended_action: рекомендуемое действие

Верни JSON: {"items": [...]}

BASELINE:
{baseline}

CURRENT:
{current}""",

    "analysis": """Ты — агент для анализа требований на тестируемость.

Проанализируй требования по критериям:
- Полнота, однозначность, тестируемость
- Критерии приемки, позитивные/негативные сценарии
- Граничные условия, противоречия, риски

Верни JSON:
{
  "summary": "...",
  "completeness_score": 0.0,
  "testability_score": 0.0,
  "problems": [{"type": "", "severity": "", "description": "", "recommendation": ""}],
  "questions": [],
  "risks": [],
  "missing_scenarios": [],
  "affected_areas": [],
  "recommendation": ""
}

ТРЕБОВАНИЯ:
{requirements}

ДЕЛЬТА:
{delta}""",

    "mindmap": """Ты — агент для формирования mind-map доработки.

Сформируй структуру доработки в Markdown:
- Добавлено (со ссылками на delta_id)
- Изменено
- Удалено
- Риски
- Открытые вопросы

ТРЕБОВАНИЯ: {requirements}
ДЕЛЬТА: {delta}
АНАЛИЗ: {analysis}""",

    "checklist": """Ты — агент для формирования чек-листа проверок.

Сформируй чек-лист на основе требований, дельты и анализа.
Каждая проверка: id, title, category, priority, related_delta_ids, rationale.

Категории: positive|negative|boundary|regression|integration|access|data|ui
Приоритеты: high|medium|low

Верни JSON: {"items": [...]}

ТРЕБОВАНИЯ: {requirements}
ДЕЛЬТА: {delta}
АНАЛИЗ: {analysis}
MINDMAP: {mindmap}""",
}


def get_prompt(agent_id: str, **kwargs: str) -> str:
    """Получить промпт с подстановкой переменных."""
    template = PROMPTS.get(agent_id)
    if template is None:
        raise ValueError(f"Неизвестный агент: {agent_id}")
    return template.format(**kwargs)`,
      },
    ],
  },
  {
    name: 'Агенты',
    icon: '🧠',
    description: 'Агенты для каждого этапа пайплайна',
    files: [
      {
        path: 'agents/__init__.py',
        language: 'python',
        description: 'Модуль агентов',
        code: `"""Агенты этапов пайплайна."""
from agents.requirement_intake_agent import RequirementIntakeAgent
from agents.requirement_diff_agent import RequirementDiffAgent
from agents.requirement_analysis_agent import RequirementAnalysisAgent
from agents.mindmap_agent import MindMapAgent
from agents.checklist_agent import ChecklistAgent

__all__ = [
    "RequirementIntakeAgent",
    "RequirementDiffAgent",
    "RequirementAnalysisAgent",
    "MindMapAgent",
    "ChecklistAgent",
]`,
      },
      {
        path: 'agents/requirement_intake_agent.py',
        language: 'python',
        description: 'Агент приема требований',
        code: `"""Агент приема требований."""
from __future__ import annotations

import logging
import uuid
from pathlib import Path

from config import get_settings
from llm.client import LLMClient
from llm.prompts import get_prompt
from parsers.registry import ParserRegistry
from schemas.requirement_version import RequirementVersion, Source

logger = logging.getLogger(__name__)


class RequirementIntakeAgent:
    """Агент для приема и нормализации требований."""

    def __init__(self, llm_client: LLMClient | None = None) -> None:
        self.llm = llm_client or LLMClient()
        self.registry = ParserRegistry()

    def run(
        self,
        run_id: uuid.UUID,
        current_path: str,
        baseline_path: str | None = None,
    ) -> tuple[RequirementVersion, RequirementVersion | None]:
        """Запустить агент."""
        settings = get_settings()
        masks = settings.workspace.file_masks

        # Парсинг текущей версии
        current_content = self._load_content(Path(current_path), masks)
        if not current_content:
            raise ValueError(f"Не найдено требований в: {current_path}")

        # Нормализация через LLM
        normalized_current = self._normalize(current_content)
        current_version = RequirementVersion(
            run_id=run_id,
            type="current",
            content=normalized_current["content"],
            sources=normalized_current["sources"],
        )

        # Парсинг baseline (опционально)
        baseline_version = None
        if baseline_path:
            baseline_content = self._load_content(Path(baseline_path), masks)
            if baseline_content:
                normalized_baseline = self._normalize(baseline_content)
                baseline_version = RequirementVersion(
                    run_id=run_id,
                    type="baseline",
                    content=normalized_baseline["content"],
                    sources=normalized_baseline["sources"],
                )
            else:
                logger.warning(f"Baseline не найден в: {baseline_path}")

        return current_version, baseline_version

    def _load_content(self, path: Path, masks: str) -> list:
        """Загрузить содержимое из пути."""
        if path.is_file():
            result = self.registry.parse_file(path)
            return [result] if result else []
        elif path.is_dir():
            return self.registry.parse_directory(path, masks)
        return []

    def _normalize(self, contents: list) -> dict:
        """Нормализовать содержимое через LLM."""
        combined = "\\n\\n---\\n\\n".join(c.content for c in contents)
        sources = [
            Source(name=c.source_name, path=c.source_path, type=c.source_type)
            for c in contents
        ]

        if self.llm.config.api_key:
            prompt = get_prompt("intake") + "\\n\\n" + combined
            normalized = self.llm.complete(prompt)
        else:
            normalized = combined

        return {"content": normalized, "sources": sources}`,
      },
      {
        path: 'agents/requirement_diff_agent.py',
        language: 'python',
        description: 'Агент сравнения версий',
        code: `"""Агент сравнения версий требований."""
from __future__ import annotations

import logging
import uuid

from llm.client import LLMClient
from llm.prompts import get_prompt
from schemas.requirement_delta import RequirementDelta
from schemas.requirement_version import RequirementVersion

logger = logging.getLogger(__name__)


class RequirementDiffAgent:
    """Агент для сравнения версий требований."""

    def __init__(self, llm_client: LLMClient | None = None) -> None:
        self.llm = llm_client or LLMClient()

    def run(
        self,
        run_id: uuid.UUID,
        current: RequirementVersion,
        baseline: RequirementVersion | None,
    ) -> RequirementDelta:
        """Сформировать дельту."""
        if baseline is None:
            # Без baseline — все элементы новые
            return RequirementDelta(
                run_id=run_id,
                baseline_version=None,
                new_version=str(current.version_id),
                items=[],
            )

        prompt = get_prompt(
            "diff",
            baseline=baseline.content,
            current=current.content,
        )

        delta = self.llm.structured_complete(
            prompt=prompt,
            schema=RequirementDelta,
        )
        delta.run_id = run_id
        delta.baseline_version = str(baseline.version_id)
        delta.new_version = str(current.version_id)
        return delta`,
      },
      {
        path: 'agents/requirement_analysis_agent.py',
        language: 'python',
        description: 'Агент анализа требований',
        code: `"""Агент анализа требований."""
from __future__ import annotations

import logging
import uuid

from llm.client import LLMClient
from llm.prompts import get_prompt
from schemas.analysis_report import AnalysisReport
from schemas.requirement_delta import RequirementDelta
from schemas.requirement_version import RequirementVersion

logger = logging.getLogger(__name__)


class RequirementAnalysisAgent:
    """Агент для анализа требований."""

    def __init__(self, llm_client: LLMClient | None = None) -> None:
        self.llm = llm_client or LLMClient()

    def run(
        self,
        run_id: uuid.UUID,
        requirements: RequirementVersion,
        delta: RequirementDelta | None,
    ) -> AnalysisReport:
        """Проанализировать требования."""
        delta_text = delta.model_dump_json(indent=2) if delta else "Нет дельты (baseline отсутствует)"

        prompt = get_prompt(
            "analysis",
            requirements=requirements.content,
            delta=delta_text,
        )

        report = self.llm.structured_complete(
            prompt=prompt,
            schema=AnalysisReport,
        )
        report.run_id = run_id
        return report`,
      },
      {
        path: 'agents/mindmap_agent.py',
        language: 'python',
        description: 'Агент формирования mind-map',
        code: `"""Агент формирования mind-map."""
from __future__ import annotations

import logging
import uuid

from llm.client import LLMClient
from llm.prompts import get_prompt
from schemas.analysis_report import AnalysisReport
from schemas.mindmap import MindMap
from schemas.requirement_delta import RequirementDelta
from schemas.requirement_version import RequirementVersion

logger = logging.getLogger(__name__)


class MindMapAgent:
    """Агент для формирования mind-map доработки."""

    def __init__(self, llm_client: LLMClient | None = None) -> None:
        self.llm = llm_client or LLMClient()

    def run(
        self,
        run_id: uuid.UUID,
        requirements: RequirementVersion,
        delta: RequirementDelta | None,
        analysis: AnalysisReport | None,
    ) -> MindMap:
        """Сформировать mind-map."""
        delta_text = delta.model_dump_json(indent=2) if delta else "Нет дельты"
        analysis_text = analysis.model_dump_json(indent=2) if analysis else "Нет анализа"

        prompt = get_prompt(
            "mindmap",
            requirements=requirements.content,
            delta=delta_text,
            analysis=analysis_text,
        )

        markdown = self.llm.complete(prompt)
        return MindMap(
            run_id=run_id,
            markdown=markdown,
            mermaid="",
            nodes=[],
        )`,
      },
      {
        path: 'agents/checklist_agent.py',
        language: 'python',
        description: 'Агент формирования чек-листа',
        code: `"""Агент формирования чек-листа."""
from __future__ import annotations

import logging
import uuid

from llm.client import LLMClient
from llm.prompts import get_prompt
from schemas.analysis_report import AnalysisReport
from schemas.checklist import Checklist
from schemas.mindmap import MindMap
from schemas.requirement_delta import RequirementDelta
from schemas.requirement_version import RequirementVersion

logger = logging.getLogger(__name__)


class ChecklistAgent:
    """Агент для формирования чек-листа проверок."""

    def __init__(self, llm_client: LLMClient | None = None) -> None:
        self.llm = llm_client or LLMClient()

    def run(
        self,
        run_id: uuid.UUID,
        requirements: RequirementVersion,
        delta: RequirementDelta | None,
        analysis: AnalysisReport | None,
        mindmap: MindMap | None,
    ) -> Checklist:
        """Сформировать чек-лист."""
        delta_text = delta.model_dump_json(indent=2) if delta else "Нет дельты"
        analysis_text = analysis.model_dump_json(indent=2) if analysis else "Нет анализа"
        mindmap_text = mindmap.markdown if mindmap else "Нет mind-map"

        prompt = get_prompt(
            "checklist",
            requirements=requirements.content,
            delta=delta_text,
            analysis=analysis_text,
            mindmap=mindmap_text,
        )

        checklist = self.llm.structured_complete(
            prompt=prompt,
            schema=Checklist,
        )
        checklist.run_id = run_id

        # Подсчет сводки
        by_category: dict[str, int] = {}
        by_priority: dict[str, int] = {}
        for item in checklist.items:
            by_category[item.category] = by_category.get(item.category, 0) + 1
            by_priority[item.priority] = by_priority.get(item.priority, 0) + 1
        checklist.summary = {
            "total": len(checklist.items),
            "by_category": by_category,
            "by_priority": by_priority,
        }
        return checklist`,
      },
    ],
  },
  {
    name: 'Граф процесса (LangGraph)',
    icon: '🔗',
    description: 'LangGraph граф, узлы, рёбра, состояние',
    files: [
      {
        path: 'graph/__init__.py',
        language: 'python',
        description: 'Модуль графа',
        code: `"""Модуль графа процесса."""
from graph.state import GraphState
from graph.pipeline import build_pipeline

__all__ = ["GraphState", "build_pipeline"]`,
      },
      {
        path: 'graph/state.py',
        language: 'python',
        description: 'Состояние графа',
        code: `"""Состояние графа LangGraph."""
from __future__ import annotations

from typing import Any, TypedDict

from schemas.analysis_report import AnalysisReport
from schemas.checklist import Checklist
from schemas.human_review import HumanReview
from schemas.mindmap import MindMap
from schemas.requirement_delta import RequirementDelta
from schemas.requirement_version import RequirementVersion
from schemas.stage_state import StageState


class GraphState(TypedDict, total=False):
    """Состояние графа пайплайна."""

    run_id: str
    current_requirements: RequirementVersion | None
    baseline_requirements: RequirementVersion | None
    delta: RequirementDelta | None
    delta_approved: bool
    analysis: AnalysisReport | None
    mindmap: MindMap | None
    checklist: Checklist | None
    current_stage: str
    stage_states: dict[str, StageState]
    human_reviews: list[HumanReview]
    errors: list[str]
    human_comments: dict[str, str]  # stage -> comment`,
      },
      {
        path: 'graph/nodes.py',
        language: 'python',
        description: 'Узлы графа',
        code: `"""Узлы графа."""
from __future__ import annotations

import json
import logging
import uuid
from pathlib import Path

from agents import (
    ChecklistAgent,
    MindMapAgent,
    RequirementAnalysisAgent,
    RequirementDiffAgent,
    RequirementIntakeAgent,
)
from config import get_settings
from graph.state import GraphState
from schemas.stage_state import StageState, StageStatus

logger = logging.getLogger(__name__)

STAGES_ORDER = [
    "intake_requirements",
    "compare_requirements",
    "confirm_delta",
    "analyze_requirements",
    "generate_mindmap",
    "generate_checklist",
    "finalize_mvp",
]


def _save_artifact(run_id: str, filename: str, data: dict | str) -> str:
    """Сохранить артефакт в workspace."""
    settings = get_settings()
    path = Path(settings.workspace.workspace_path) / "runs" / run_id / "artifacts"
    path.mkdir(parents=True, exist_ok=True)
    file_path = path / filename
    if isinstance(data, str):
        file_path.write_text(data, encoding="utf-8")
    else:
        file_path.write_text(json.dumps(data, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
    return str(file_path)


def intake_requirements(state: GraphState) -> GraphState:
    """Узел: прием требований."""
    run_id = uuid.UUID(state["run_id"])
    settings = get_settings()
    agent = RequirementIntakeAgent()
    try:
        current, baseline = agent.run(
            run_id=run_id,
            current_path=settings.workspace.current_path,
            baseline_path=settings.workspace.baseline_path or None,
        )
        artifact_path = _save_artifact(state["run_id"], "requirement_intake.json", {
            "current": current.model_dump(mode="json"),
            "baseline": baseline.model_dump(mode="json") if baseline else None,
        })
        stage_states = dict(state.get("stage_states", {}))
        stage_states["intake_requirements"] = StageState(
            run_id=run_id, stage="intake_requirements",
            status=StageStatus.WAITING_FOR_HUMAN, iteration=1, result_path=artifact_path,
        )
        return {
            **state,
            "current_requirements": current,
            "baseline_requirements": baseline,
            "current_stage": "intake_requirements",
            "stage_states": stage_states,
        }
    except Exception as e:
        logger.error(f"Ошибка intake: {e}")
        errors = list(state.get("errors", []))
        errors.append(f"intake_requirements: {e}")
        return {**state, "errors": errors}


def compare_requirements(state: GraphState) -> GraphState:
    """Узел: сравнение версий."""
    run_id = uuid.UUID(state["run_id"])
    agent = RequirementDiffAgent()
    try:
        delta = agent.run(
            run_id=run_id,
            current=state["current_requirements"],
            baseline=state.get("baseline_requirements"),
        )
        artifact_path = _save_artifact(state["run_id"], "requirement_delta.json", delta.model_dump(mode="json"))
        stage_states = dict(state.get("stage_states", {}))
        stage_states["compare_requirements"] = StageState(
            run_id=run_id, stage="compare_requirements",
            status=StageStatus.WAITING_FOR_HUMAN, iteration=1, result_path=artifact_path,
        )
        return {
            **state,
            "delta": delta,
            "current_stage": "compare_requirements",
            "stage_states": stage_states,
        }
    except Exception as e:
        errors = list(state.get("errors", []))
        errors.append(f"compare_requirements: {e}")
        return {**state, "errors": errors}


def confirm_delta(state: GraphState) -> GraphState:
    """Узел: подтверждение дельты."""
    stage_states = dict(state.get("stage_states", {}))
    run_id = uuid.UUID(state["run_id"])
    stage_states["confirm_delta"] = StageState(
        run_id=run_id, stage="confirm_delta",
        status=StageStatus.WAITING_FOR_HUMAN, iteration=1,
    )
    return {**state, "current_stage": "confirm_delta", "stage_states": stage_states}


def analyze_requirements(state: GraphState) -> GraphState:
    """Узел: анализ требований."""
    run_id = uuid.UUID(state["run_id"])
    agent = RequirementAnalysisAgent()
    try:
        report = agent.run(
            run_id=run_id,
            requirements=state["current_requirements"],
            delta=state.get("delta"),
        )
        artifact_json = _save_artifact(state["run_id"], "requirement_analysis.json", report.model_dump(mode="json"))
        artifact_md = _save_artifact(state["run_id"], "requirement_analysis.md", _report_to_markdown(report))
        stage_states = dict(state.get("stage_states", {}))
        stage_states["analyze_requirements"] = StageState(
            run_id=run_id, stage="analyze_requirements",
            status=StageStatus.WAITING_FOR_HUMAN, iteration=1, result_path=artifact_json,
        )
        return {
            **state,
            "analysis": report,
            "current_stage": "analyze_requirements",
            "stage_states": stage_states,
        }
    except Exception as e:
        errors = list(state.get("errors", []))
        errors.append(f"analyze_requirements: {e}")
        return {**state, "errors": errors}


def generate_mindmap(state: GraphState) -> GraphState:
    """Узел: формирование mind-map."""
    run_id = uuid.UUID(state["run_id"])
    agent = MindMapAgent()
    try:
        mindmap = agent.run(
            run_id=run_id,
            requirements=state["current_requirements"],
            delta=state.get("delta"),
            analysis=state.get("analysis"),
        )
        artifact_path = _save_artifact(state["run_id"], "mindmap.md", mindmap.markdown)
        stage_states = dict(state.get("stage_states", {}))
        stage_states["generate_mindmap"] = StageState(
            run_id=run_id, stage="generate_mindmap",
            status=StageStatus.WAITING_FOR_HUMAN, iteration=1, result_path=artifact_path,
        )
        return {
            **state,
            "mindmap": mindmap,
            "current_stage": "generate_mindmap",
            "stage_states": stage_states,
        }
    except Exception as e:
        errors = list(state.get("errors", []))
        errors.append(f"generate_mindmap: {e}")
        return {**state, "errors": errors}


def generate_checklist(state: GraphState) -> GraphState:
    """Узел: формирование чек-листа."""
    run_id = uuid.UUID(state["run_id"])
    agent = ChecklistAgent()
    try:
        checklist = agent.run(
            run_id=run_id,
            requirements=state["current_requirements"],
            delta=state.get("delta"),
            analysis=state.get("analysis"),
            mindmap=state.get("mindmap"),
        )
        artifact_json = _save_artifact(state["run_id"], "checklist.json", checklist.model_dump(mode="json"))
        artifact_md = _save_artifact(state["run_id"], "checklist.md", _checklist_to_markdown(checklist))
        stage_states = dict(state.get("stage_states", {}))
        stage_states["generate_checklist"] = StageState(
            run_id=run_id, stage="generate_checklist",
            status=StageStatus.WAITING_FOR_HUMAN, iteration=1, result_path=artifact_json,
        )
        return {
            **state,
            "checklist": checklist,
            "current_stage": "generate_checklist",
            "stage_states": stage_states,
        }
    except Exception as e:
        errors = list(state.get("errors", []))
        errors.append(f"generate_checklist: {e}")
        return {**state, "errors": errors}


def finalize_mvp(state: GraphState) -> GraphState:
    """Узел: финализация MVP."""
    report = _build_mvp_report(state)
    _save_artifact(state["run_id"], "mvp_report.md", report)
    return {**state, "current_stage": "finalize_mvp"}


def _report_to_markdown(report) -> str:
    """Преобразовать отчет в Markdown."""
    lines = [
        "# Отчет об анализе требований",
        "",
        f"**Резюме:** {report.summary}",
        f"**Полнота:** {report.completeness_score:.0%}",
        f"**Тестируемость:** {report.testability_score:.0%}",
        "",
        "## Проблемы",
    ]
    for p in report.problems:
        lines.append(f"- [{p.severity}] {p.description}")
    lines.extend(["", "## Вопросы"])
    for q in report.questions:
        lines.append(f"- {q}")
    lines.extend(["", "## Риски"])
    for r in report.risks:
        lines.append(f"- {r.description}")
    return "\\n".join(lines)


def _checklist_to_markdown(checklist) -> str:
    """Преобразовать чек-лист в Markdown."""
    lines = ["# Чек-лист проверок", ""]
    for item in checklist.items:
        lines.append(f"- [{item.priority}] **{item.title}** ({item.category})")
        lines.append(f"  - {item.rationale}")
    return "\\n".join(lines)


def _build_mvp_report(state: GraphState) -> str:
    """Собрать итоговый MVP-отчет."""
    lines = [
        "# MVP Report",
        f"Run ID: {state['run_id']}",
        "",
        "## Этапы",
    ]
    for stage, ss in state.get("stage_states", {}).items():
        lines.append(f"- {stage}: {ss.status}")
    return "\\n".join(lines)`,
      },
      {
        path: 'graph/edges.py',
        language: 'python',
        description: 'Условные рёбра графа',
        code: `"""Условные рёбра графа."""
from __future__ import annotations

from graph.state import GraphState
from schemas.stage_state import StageStatus


def route_after_intake(state: GraphState) -> str:
    """Маршрут после intake."""
    if state.get("errors"):
        return "__end__"
    stage_states = state.get("stage_states", {})
    intake_state = stage_states.get("intake_requirements")
    if intake_state and intake_state.status == StageStatus.APPROVED:
        return "compare_requirements"
    return "__interrupt__"


def route_after_compare(state: GraphState) -> str:
    """Маршрут после compare."""
    if state.get("errors"):
        return "__end__"
    stage_states = state.get("stage_states", {})
    compare_state = stage_states.get("compare_requirements")
    if compare_state and compare_state.status == StageStatus.APPROVED:
        return "confirm_delta"
    return "__interrupt__"


def route_after_confirm(state: GraphState) -> str:
    """Маршрут после confirm_delta."""
    if state.get("errors"):
        return "__end__"
    if state.get("delta_approved"):
        return "analyze_requirements"
    return "__interrupt__"


def route_after_analyze(state: GraphState) -> str:
    """Маршрут после analyze."""
    if state.get("errors"):
        return "__end__"
    stage_states = state.get("stage_states", {})
    analyze_state = stage_states.get("analyze_requirements")
    if analyze_state and analyze_state.status == StageStatus.APPROVED:
        return "generate_mindmap"
    return "__interrupt__"


def route_after_mindmap(state: GraphState) -> str:
    """Маршрут после mindmap."""
    if state.get("errors"):
        return "__end__"
    stage_states = state.get("stage_states", {})
    mindmap_state = stage_states.get("generate_mindmap")
    if mindmap_state and mindmap_state.status == StageStatus.APPROVED:
        return "generate_checklist"
    return "__interrupt__"


def route_after_checklist(state: GraphState) -> str:
    """Маршрут после checklist — финальная остановка MVP."""
    if state.get("errors"):
        return "__end__"
    stage_states = state.get("stage_states", {})
    checklist_state = stage_states.get("generate_checklist")
    if checklist_state and checklist_state.status == StageStatus.APPROVED:
        return "finalize_mvp"
    return "__interrupt__"`,
      },
      {
        path: 'graph/pipeline.py',
        language: 'python',
        description: 'Сборка графа',
        code: `"""Сборка LangGraph пайплайна."""
from __future__ import annotations

from langgraph.graph import END, StateGraph

from graph.edges import (
    route_after_analyze,
    route_after_checklist,
    route_after_compare,
    route_after_confirm,
    route_after_intake,
    route_after_mindmap,
)
from graph.nodes import (
    analyze_requirements,
    compare_requirements,
    confirm_delta,
    finalize_mvp,
    generate_checklist,
    generate_mindmap,
    intake_requirements,
)
from graph.state import GraphState


def build_pipeline() -> StateGraph:
    """Построить граф пайплайна."""
    graph = StateGraph(GraphState)

    # Добавление узлов
    graph.add_node("intake_requirements", intake_requirements)
    graph.add_node("compare_requirements", compare_requirements)
    graph.add_node("confirm_delta", confirm_delta)
    graph.add_node("analyze_requirements", analyze_requirements)
    graph.add_node("generate_mindmap", generate_mindmap)
    graph.add_node("generate_checklist", generate_checklist)
    graph.add_node("finalize_mvp", finalize_mvp)

    # Точка входа
    graph.set_entry_point("intake_requirements")

    # Рёбра с условиями
    graph.add_conditional_edges("intake_requirements", route_after_intake, {
        "compare_requirements": "compare_requirements",
        "__interrupt__": END,
        "__end__": END,
    })
    graph.add_conditional_edges("compare_requirements", route_after_compare, {
        "confirm_delta": "confirm_delta",
        "__interrupt__": END,
        "__end__": END,
    })
    graph.add_conditional_edges("confirm_delta", route_after_confirm, {
        "analyze_requirements": "analyze_requirements",
        "__interrupt__": END,
        "__end__": END,
    })
    graph.add_conditional_edges("analyze_requirements", route_after_analyze, {
        "generate_mindmap": "generate_mindmap",
        "__interrupt__": END,
        "__end__": END,
    })
    graph.add_conditional_edges("generate_mindmap", route_after_mindmap, {
        "generate_checklist": "generate_checklist",
        "__interrupt__": END,
        "__end__": END,
    })
    graph.add_conditional_edges("generate_checklist", route_after_checklist, {
        "finalize_mvp": "finalize_mvp",
        "__interrupt__": END,
        "__end__": END,
    })
    graph.add_edge("finalize_mvp", END)

    return graph.compile()`,
      },
    ],
  },
];
