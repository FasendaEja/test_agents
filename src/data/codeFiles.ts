// Полный код всех файлов Python-проекта QA Agent MVP

export interface CodeFile {
  path: string;
  language: string;
  code: string;
  description: string;
}

export interface CodeModule {
  name: string;
  icon: string;
  description: string;
  files: CodeFile[];
}

export const projectModules: CodeModule[] = [
  {
    name: 'Каркас проекта',
    icon: '🏗️',
    description: 'Базовые файлы конфигурации и точка входа',
    files: [
      {
        path: 'pyproject.toml',
        language: 'toml',
        description: 'Зависимости и метаданные проекта',
        code: `[project]
name = "qa-agent-mvp"
version = "0.2.0"
description = "Агентная система для анализа требований и подготовки первичных проверок"
requires-python = ">=3.11"
dependencies = [
    "langgraph>=0.2.0",
    "langchain-openai>=0.1.0",
    "pydantic>=2.5.0",
    "pydantic-settings>=2.1.0",
    "sqlalchemy>=2.0.25",
    "alembic>=1.13.0",
    "psycopg[binary]>=3.1.0",
    "typer>=0.9.0",
    "rich>=13.7.0",
    "openai>=1.10.0",
    "python-dotenv>=1.0.0",
    "python-docx>=1.1.0",
    "openpyxl>=3.1.0",
    "pyyaml>=6.0.0",
    "python-magic>=0.4.27",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-cov>=4.1.0",
    "pytest-asyncio>=0.23.0",
    "ruff>=0.1.0",
    "mypy>=1.8.0",
]

[project.scripts]
qa-agent = "cli.main:app"

[build-system]
requires = ["setuptools>=68.0"]
build-backend = "setuptools.build_meta"

[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"

[tool.ruff]
line-length = 100
target-version = "py311"`,
      },
      {
        path: 'config.py',
        language: 'python',
        description: 'Конфигурация приложения через pydantic-settings',
        code: `"""Конфигурация приложения."""
from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class LLMConfig(BaseSettings):
    """Конфигурация LLM."""

    model_config = SettingsConfigDict(env_prefix="LLM_")

    api_key: str = Field(default="", alias="OPENAI_API_KEY")
    base_url: str = Field(default="https://api.openai.com/v1", alias="OPENAI_BASE_URL")
    model: str = "qwen3.8"
    temperature: float = 0.2
    max_tokens: int = 8000
    timeout: int = 120
    max_retries: int = 3


class DatabaseConfig(BaseSettings):
    """Конфигурация базы данных."""

    model_config = SettingsConfigDict(env_prefix="DB_")

    database_url: str = Field(
        default="postgresql+psycopg://qa_agent:qa_agent@localhost:5432/qa_agent",
        alias="DATABASE_URL",
    )
    echo: bool = False
    pool_size: int = 10
    max_overflow: int = 20
    pool_timeout: int = 30


class WorkspaceConfig(BaseSettings):
    """Конфигурация рабочего пространства."""

    model_config = SettingsConfigDict(env_prefix="REQUIREMENTS_")

    workspace_path: str = Field(default="./workspace", alias="WORKSPACE_PATH")
    source_type: str = "folder"
    current_path: str = "./requirements/current"
    baseline_path: str = ""
    file_masks: str = "*.md,*.txt,*.json,*.yaml,*.yml,*.csv,*.docx,*.xlsx"


class HumanReviewConfig(BaseSettings):
    """Конфигурация human-in-the-loop."""

    model_config = SettingsConfigDict(env_prefix="HUMAN_REVIEW_")

    mode: str = "cli"
    max_stage_iterations: int = Field(default=5, alias="MAX_STAGE_ITERATIONS")


class Settings(BaseSettings):
    """Агрегированные настройки приложения."""

    llm: LLMConfig = Field(default_factory=LLMConfig)
    database: DatabaseConfig = Field(default_factory=DatabaseConfig)
    workspace: WorkspaceConfig = Field(default_factory=WorkspaceConfig)
    human_review: HumanReviewConfig = Field(default_factory=HumanReviewConfig)


def get_settings() -> Settings:
    """Получить настройки приложения."""
    return Settings()`,
      },
      {
        path: 'main.py',
        language: 'python',
        description: 'Точка входа приложения',
        code: `"""Точка входа приложения QA Agent MVP."""
from __future__ import annotations

import sys

from dotenv import load_dotenv


def main() -> None:
    """Запуск приложения."""
    load_dotenv()

    from cli.main import app

    app()


if __name__ == "__main__":
    main()`,
      },
      {
        path: '.env.example',
        language: 'env',
        description: 'Шаблон переменных окружения',
        code: `# LLM
OPENAI_API_KEY=
OPENAI_BASE_URL=
LLM_MODEL=qwen3.8
LLM_TEMPERATURE=0.2
LLM_MAX_TOKENS=8000
LLM_TIMEOUT=120
LLM_MAX_RETRIES=3

# Database
DATABASE_URL=postgresql+psycopg://qa_agent:qa_agent@localhost:5432/qa_agent
DB_ECHO=false
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_POOL_TIMEOUT=30

# Workspace
WORKSPACE_PATH=./workspace

# Requirements source
REQUIREMENTS_SOURCE_TYPE=folder
REQUIREMENTS_CURRENT_PATH=./requirements/current
REQUIREMENTS_BASELINE_PATH=
REQUIREMENTS_FILE_MASKS=*.md,*.txt,*.json,*.yaml,*.yml,*.csv,*.docx,*.xlsx

# Human review
HUMAN_REVIEW_MODE=cli
MAX_STAGE_ITERATIONS=5`,
      },
    ],
  },
  {
    name: 'Схемы данных (Pydantic)',
    icon: '📐',
    description: 'Pydantic-схемы для всех сущностей',
    files: [
      {
        path: 'schemas/__init__.py',
        language: 'python',
        description: 'Экспорт всех схем',
        code: `"""Схемы данных приложения."""
from schemas.run import Run, RunStatus
from schemas.stage_state import StageState, StageStatus
from schemas.human_review import HumanReview, HumanDecision
from schemas.rationale import Rationale
from schemas.requirement_version import RequirementVersion, Source
from schemas.requirement_delta import RequirementDelta, DeltaItem, DeltaType
from schemas.analysis_report import AnalysisReport, Problem, Risk
from schemas.mindmap import MindMap, MindMapNode
from schemas.checklist import Checklist, ChecklistItem, ChecklistCategory, Priority

__all__ = [
    "Run", "RunStatus",
    "StageState", "StageStatus",
    "HumanReview", "HumanDecision",
    "Rationale",
    "RequirementVersion", "Source",
    "RequirementDelta", "DeltaItem", "DeltaType",
    "AnalysisReport", "Problem", "Risk",
    "MindMap", "MindMapNode",
    "Checklist", "ChecklistItem", "ChecklistCategory", "Priority",
]`,
      },
      {
        path: 'schemas/run.py',
        language: 'python',
        description: 'Схема запуска пайплайна',
        code: `"""Схема запуска пайплайна."""
from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class RunStatus(StrEnum):
    """Статус запуска."""
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"


class Run(BaseModel):
    """Запуск пайплайна."""

    run_id: UUID = Field(default_factory=uuid4)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    status: RunStatus = RunStatus.RUNNING
    current_stage: str = "intake_requirements"
    config: dict = Field(default_factory=dict)`,
      },
      {
        path: 'schemas/stage_state.py',
        language: 'python',
        description: 'Состояние этапа',
        code: `"""Состояние этапа пайплайна."""
from __future__ import annotations

from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, Field


class StageStatus(StrEnum):
    """Статус этапа."""
    PENDING = "pending"
    RUNNING = "running"
    WAITING_FOR_HUMAN = "waiting_for_human"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEEDS_RERUN = "needs_rerun"
    FAILED = "failed"
    SKIPPED = "skipped"


class StageState(BaseModel):
    """Состояние этапа."""

    run_id: UUID
    stage: str
    status: StageStatus = StageStatus.PENDING
    iteration: int = 0
    max_iterations: int = 5
    result_path: str | None = None
    rationale_path: str | None = None
    error: str | None = None`,
      },
      {
        path: 'schemas/human_review.py',
        language: 'python',
        description: 'Решение человека',
        code: `"""Решение человека по этапу."""
from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class HumanDecision(StrEnum):
    """Решение человека."""
    APPROVE = "approve"
    REJECT = "reject"
    RERUN_WITH_COMMENTS = "rerun_with_comments"


class HumanReview(BaseModel):
    """Решение человека по этапу."""

    review_id: UUID = Field(default_factory=uuid4)
    run_id: UUID
    stage: str
    iteration: int
    decision: HumanDecision
    comment: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)`,
      },
      {
        path: 'schemas/rationale.py',
        language: 'python',
        description: 'Объяснение результата этапа',
        code: `"""Объяснение результата этапа."""
from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, Field


class Rationale(BaseModel):
    """Объяснение результата этапа."""

    run_id: UUID
    stage: str
    summary: str
    used_sources: list[str] = Field(default_factory=list)
    used_fragments: list[str] = Field(default_factory=list)
    assumptions: list[str] = Field(default_factory=list)
    missing_information: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    confidence: str = "medium"
    changes_from_previous_iteration: list[str] = Field(default_factory=list)`,
      },
      {
        path: 'schemas/requirement_version.py',
        language: 'python',
        description: 'Версия требований',
        code: `"""Версия требований."""
from __future__ import annotations

from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class Source(BaseModel):
    """Источник требований."""

    name: str
    path: str
    type: str
    metadata: dict = Field(default_factory=dict)


class RequirementVersion(BaseModel):
    """Версия требований."""

    version_id: UUID = Field(default_factory=uuid4)
    run_id: UUID
    type: str  # current | baseline
    content: str
    sources: list[Source] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)`,
      },
      {
        path: 'schemas/requirement_delta.py',
        language: 'python',
        description: 'Дельта изменений',
        code: `"""Дельта изменений между версиями требований."""
from __future__ import annotations

from enum import StrEnum
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class DeltaType(StrEnum):
    """Тип изменения."""
    ADDED = "added"
    CHANGED = "changed"
    REMOVED = "removed"
    UNCHANGED = "unchanged"
    MOVED = "moved"
    RENAMED = "renamed"
    UNCLEAR = "unclear"


class DeltaItem(BaseModel):
    """Отдельное изменение в требованиях."""

    delta_id: str = Field(default_factory=lambda: str(uuid4())[:8])
    type: DeltaType
    title: str
    old_text: str = ""
    new_text: str = ""
    source_baseline: str = ""
    source_current: str = ""
    semantic_change: bool = True
    formatting_only: bool = False
    impact_areas: list[str] = Field(default_factory=list)
    rationale: str = ""
    recommended_action: str = ""
    human_decision: str = "pending"


class RequirementDelta(BaseModel):
    """Дельта изменений между версиями."""

    run_id: UUID
    baseline_version: str | None = None
    new_version: str
    items: list[DeltaItem] = Field(default_factory=list)`,
      },
      {
        path: 'schemas/analysis_report.py',
        language: 'python',
        description: 'Отчет об анализе требований',
        code: `"""Отчет об анализе требований."""
from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, Field


class Problem(BaseModel):
    """Проблема в требованиях."""

    type: str  # completeness, ambiguity, testability, contradiction, missing_scenario
    severity: str  # high, medium, low
    description: str
    location: str = ""
    recommendation: str = ""


class Risk(BaseModel):
    """Риск."""

    description: str
    severity: str = "medium"
    mitigation: str = ""


class AnalysisReport(BaseModel):
    """Отчет об анализе требований."""

    run_id: UUID
    summary: str
    completeness_score: float = 0.0
    testability_score: float = 0.0
    problems: list[Problem] = Field(default_factory=list)
    questions: list[str] = Field(default_factory=list)
    risks: list[Risk] = Field(default_factory=list)
    missing_scenarios: list[str] = Field(default_factory=list)
    affected_areas: list[str] = Field(default_factory=list)
    related_delta_ids: list[str] = Field(default_factory=list)
    recommendation: str = ""`,
      },
      {
        path: 'schemas/mindmap.py',
        language: 'python',
        description: 'Mind-map доработки',
        code: `"""Mind-map доработки."""
from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, Field


class MindMapNode(BaseModel):
    """Узел mind-map."""

    id: str
    title: str
    type: str  # new, changed, removed, risk, question
    delta_id: str | None = None
    description: str = ""
    children: list["MindMapNode"] = Field(default_factory=list)


class MindMap(BaseModel):
    """Mind-map доработки."""

    run_id: UUID
    markdown: str
    mermaid: str = ""
    nodes: list[MindMapNode] = Field(default_factory=list)`,
      },
      {
        path: 'schemas/checklist.py',
        language: 'python',
        description: 'Чек-лист проверок',
        code: `"""Чек-лист проверок."""
from __future__ import annotations

from enum import StrEnum
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class ChecklistCategory(StrEnum):
    """Категория проверки."""
    POSITIVE = "positive"
    NEGATIVE = "negative"
    BOUNDARY = "boundary"
    REGRESSION = "regression"
    INTEGRATION = "integration"
    ACCESS = "access"
    DATA = "data"
    UI = "ui"


class Priority(StrEnum):
    """Приоритет."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ChecklistItem(BaseModel):
    """Пункт чек-листа."""

    id: str = Field(default_factory=lambda: f"check_{uuid4().hex[:6]}")
    title: str
    category: ChecklistCategory
    priority: Priority
    related_delta_ids: list[str] = Field(default_factory=list)
    rationale: str = ""


class Checklist(BaseModel):
    """Чек-лист проверок."""

    run_id: UUID
    items: list[ChecklistItem] = Field(default_factory=list)
    summary: dict = Field(default_factory=dict)`,
      },
    ],
  },
  {
    name: 'Парсеры файлов',
    icon: '📄',
    description: 'Парсеры для различных форматов файлов',
    files: [
      {
        path: 'parsers/__init__.py',
        language: 'python',
        description: 'Модуль парсеров',
        code: `"""Парсеры файлов."""
from parsers.base import BaseParser, ParsedContent
from parsers.registry import ParserRegistry

__all__ = ["BaseParser", "ParsedContent", "ParserRegistry"]`,
      },
      {
        path: 'parsers/base.py',
        language: 'python',
        description: 'Базовый класс парсера',
        code: `"""Базовый класс парсера."""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class ParsedContent:
    """Результат парсинга файла."""

    content: str
    source_name: str
    source_path: str
    source_type: str
    metadata: dict = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)


class BaseParser(ABC):
    """Абстрактный базовый класс парсера."""

    @abstractmethod
    def supports(self, extension: str) -> bool:
        """Проверить, поддерживает ли парсер расширение."""
        ...

    @abstractmethod
    def parse(self, file_path: Path) -> ParsedContent:
        """Распарсить файл."""
        ...

    def _validate_file(self, file_path: Path) -> None:
        """Валидация файла."""
        if not file_path.exists():
            raise FileNotFoundError(f"Файл не найден: {file_path}")
        if not file_path.is_file():
            raise ValueError(f"Не является файлом: {file_path}")
        if file_path.stat().st_size == 0:
            raise ValueError(f"Пустой файл: {file_path}")`,
      },
      {
        path: 'parsers/registry.py',
        language: 'python',
        description: 'Реестр парсеров',
        code: `"""Реестр парсеров."""
from __future__ import annotations

import logging
from pathlib import Path

from parsers.base import BaseParser, ParsedContent
from parsers.txt_parser import TxtParser
from parsers.markdown_parser import MarkdownParser
from parsers.json_parser import JsonParser
from parsers.yaml_parser import YamlParser
from parsers.csv_parser import CsvParser
from parsers.docx_parser import DocxParser
from parsers.excel_parser import ExcelParser

logger = logging.getLogger(__name__)


class ParserRegistry:
    """Реестр парсеров файлов."""

    def __init__(self) -> None:
        self._parsers: list[BaseParser] = [
            TxtParser(),
            MarkdownParser(),
            JsonParser(),
            YamlParser(),
            CsvParser(),
            DocxParser(),
            ExcelParser(),
        ]

    def get_parser(self, file_path: Path) -> BaseParser | None:
        """Получить парсер для файла."""
        extension = file_path.suffix.lower()
        for parser in self._parsers:
            if parser.supports(extension):
                return parser
        return None

    def parse_file(self, file_path: Path) -> ParsedContent | None:
        """Распарсить файл."""
        parser = self.get_parser(file_path)
        if parser is None:
            logger.warning(f"Неподдерживаемый формат: {file_path.suffix}")
            return None
        try:
            return parser.parse(file_path)
        except Exception as e:
            logger.error(f"Ошибка парсинга {file_path}: {e}")
            return None

    def parse_directory(self, dir_path: Path, masks: str = "*.md,*.txt") -> list[ParsedContent]:
        """Распарсить все файлы в директории."""
        results: list[ParsedContent] = []
        if not dir_path.exists():
            logger.warning(f"Директория не найдена: {dir_path}")
            return results

        extensions = [m.strip().replace("*", "") for m in masks.split(",")]

        for file_path in sorted(dir_path.rglob("*")):
            if not file_path.is_file():
                continue
            if file_path.suffix.lower() not in extensions:
                continue
            result = self.parse_file(file_path)
            if result:
                results.append(result)
        return results`,
      },
      {
        path: 'parsers/txt_parser.py',
        language: 'python',
        description: 'Парсер .txt файлов',
        code: `"""Парсер текстовых файлов."""
from __future__ import annotations

from pathlib import Path

from parsers.base import BaseParser, ParsedContent


class TxtParser(BaseParser):
    """Парсер .txt файлов."""

    def supports(self, extension: str) -> bool:
        return extension == ".txt"

    def parse(self, file_path: Path) -> ParsedContent:
        self._validate_file(file_path)
        content = file_path.read_text(encoding="utf-8")
        if not content.strip():
            raise ValueError(f"Файл пуст: {file_path}")
        return ParsedContent(
            content=content,
            source_name=file_path.name,
            source_path=str(file_path),
            source_type="txt",
        )`,
      },
      {
        path: 'parsers/markdown_parser.py',
        language: 'python',
        description: 'Парсер .md файлов',
        code: `"""Парсер Markdown файлов."""
from __future__ import annotations

from pathlib import Path

from parsers.base import BaseParser, ParsedContent


class MarkdownParser(BaseParser):
    """Парсер .md/.markdown файлов."""

    def supports(self, extension: str) -> bool:
        return extension in {".md", ".markdown"}

    def parse(self, file_path: Path) -> ParsedContent:
        self._validate_file(file_path)
        content = file_path.read_text(encoding="utf-8")
        if not content.strip():
            raise ValueError(f"Файл пуст: {file_path}")
        return ParsedContent(
            content=content,
            source_name=file_path.name,
            source_path=str(file_path),
            source_type="markdown",
        )`,
      },
      {
        path: 'parsers/json_parser.py',
        language: 'python',
        description: 'Парсер .json файлов',
        code: `"""Парсер JSON файлов."""
from __future__ import annotations

import json
from pathlib import Path

from parsers.base import BaseParser, ParsedContent


class JsonParser(BaseParser):
    """Парсер .json файлов."""

    def supports(self, extension: str) -> bool:
        return extension == ".json"

    def parse(self, file_path: Path) -> ParsedContent:
        self._validate_file(file_path)
        raw = file_path.read_text(encoding="utf-8")
        if not raw.strip():
            raise ValueError(f"Файл пуст: {file_path}")
        data = json.loads(raw)
        content = self._flatten_json(data)
        return ParsedContent(
            content=content,
            source_name=file_path.name,
            source_path=str(file_path),
            source_type="json",
            metadata={"structure": type(data).__name__},
        )

    def _flatten_json(self, data: object, prefix: str = "") -> str:
        """Преобразовать JSON в читаемый текст."""
        lines: list[str] = []
        if isinstance(data, dict):
            for key, value in data.items():
                path = f"{prefix}.{key}" if prefix else key
                if isinstance(value, (dict, list)):
                    lines.append(f"## {path}")
                    lines.append(self._flatten_json(value, path))
                else:
                    lines.append(f"- **{path}**: {value}")
        elif isinstance(data, list):
            for i, item in enumerate(data):
                lines.append(f"### Элемент {i + 1}")
                lines.append(self._flatten_json(item, f"{prefix}[{i}]"))
        else:
            lines.append(str(data))
        return "\\n".join(lines)`,
      },
      {
        path: 'parsers/yaml_parser.py',
        language: 'python',
        description: 'Парсер .yaml/.yml файлов',
        code: `"""Парсер YAML файлов."""
from __future__ import annotations

from pathlib import Path

import yaml

from parsers.base import BaseParser, ParsedContent


class YamlParser(BaseParser):
    """Парсер .yaml/.yml файлов."""

    def supports(self, extension: str) -> bool:
        return extension in {".yaml", ".yml"}

    def parse(self, file_path: Path) -> ParsedContent:
        self._validate_file(file_path)
        raw = file_path.read_text(encoding="utf-8")
        if not raw.strip():
            raise ValueError(f"Файл пуст: {file_path}")
        data = yaml.safe_load(raw)
        content = yaml.dump(data, allow_unicode=True, default_flow_style=False)
        return ParsedContent(
            content=content,
            source_name=file_path.name,
            source_path=str(file_path),
            source_type="yaml",
        )`,
      },
      {
        path: 'parsers/csv_parser.py',
        language: 'python',
        description: 'Парсер .csv файлов',
        code: `"""Парсер CSV файлов."""
from __future__ import annotations

import csv
from pathlib import Path

from parsers.base import BaseParser, ParsedContent


class CsvParser(BaseParser):
    """Парсер .csv файлов."""

    def supports(self, extension: str) -> bool:
        return extension == ".csv"

    def parse(self, file_path: Path) -> ParsedContent:
        self._validate_file(file_path)
        lines: list[str] = []
        with open(file_path, encoding="utf-8", newline="") as f:
            # Определяем разделитель
            sample = f.read(2048)
            f.seek(0)
            dialect = csv.Sniffer().sniff(sample, delimiters=",;\\t|")
            reader = csv.DictReader(f, dialect=dialect)
            headers = reader.fieldnames or []
            lines.append(f"Колонки: {', '.join(headers)}\\n")
            for i, row in enumerate(reader, 1):
                lines.append(f"### Запись {i}")
                for key, value in row.items():
                    lines.append(f"- **{key}**: {value}")
                lines.append("")
        content = "\\n".join(lines)
        if not content.strip():
            raise ValueError(f"Файл пуст: {file_path}")
        return ParsedContent(
            content=content,
            source_name=file_path.name,
            source_path=str(file_path),
            source_type="csv",
            metadata={"columns": headers},
        )`,
      },
      {
        path: 'parsers/docx_parser.py',
        language: 'python',
        description: 'Парсер .docx файлов',
        code: `"""Парсер DOCX файлов."""
from __future__ import annotations

from pathlib import Path

from parsers.base import BaseParser, ParsedContent


class DocxParser(BaseParser):
    """Парсер .docx файлов."""

    def supports(self, extension: str) -> bool:
        return extension == ".docx"

    def parse(self, file_path: Path) -> ParsedContent:
        self._validate_file(file_path)
        try:
            from docx import Document
        except ImportError as e:
            raise ImportError("Установите python-docx: pip install python-docx") from e

        doc = Document(str(file_path))
        lines: list[str] = []
        for para in doc.paragraphs:
            text = para.text.strip()
            if not text:
                continue
            if para.style and para.style.name.startswith("Heading"):
                level = para.style.name.replace("Heading ", "")
                lines.append(f"{'#' * int(level)} {text}")
            else:
                lines.append(text)

        # Таблицы
        for i, table in enumerate(doc.tables):
            lines.append(f"\\n### Таблица {i + 1}")
            for row in table.rows:
                cells = [cell.text.strip() for cell in row.cells]
                lines.append("| " + " | ".join(cells) + " |")

        content = "\\n".join(lines)
        if not content.strip():
            raise ValueError(f"Файл пуст: {file_path}")
        return ParsedContent(
            content=content,
            source_name=file_path.name,
            source_path=str(file_path),
            source_type="docx",
            metadata={"paragraphs": len(doc.paragraphs), "tables": len(doc.tables)},
        )`,
      },
      {
        path: 'parsers/excel_parser.py',
        language: 'python',
        description: 'Парсер .xlsx файлов',
        code: `"""Парсер Excel файлов."""
from __future__ import annotations

from pathlib import Path

from parsers.base import BaseParser, ParsedContent


class ExcelParser(BaseParser):
    """Парсер .xlsx файлов."""

    def supports(self, extension: str) -> bool:
        return extension == ".xlsx"

    def parse(self, file_path: Path) -> ParsedContent:
        self._validate_file(file_path)
        try:
            from openpyxl import load_workbook
        except ImportError as e:
            raise ImportError("Установите openpyxl: pip install openpyxl") from e

        wb = load_workbook(str(file_path), read_only=True, data_only=True)
        lines: list[str] = []
        for sheet_name in wb.sheetnames:
            ws = wb[sheet_name]
            lines.append(f"# Лист: {sheet_name}")
            rows = list(ws.iter_rows(values_only=True))
            if not rows:
                continue
            headers = [str(c) if c is not None else "" for c in rows[0]]
            lines.append("| " + " | ".join(headers) + " |")
            lines.append("| " + " | ".join(["---"] * len(headers)) + " |")
            for row in rows[1:]:
                cells = [str(c) if c is not None else "" for c in row]
                lines.append("| " + " | ".join(cells) + " |")
            lines.append("")
        wb.close()

        content = "\\n".join(lines)
        if not content.strip():
            raise ValueError(f"Файл пуст: {file_path}")
        return ParsedContent(
            content=content,
            source_name=file_path.name,
            source_path=str(file_path),
            source_type="xlsx",
            metadata={"sheets": wb.sheetnames},
        )`,
      },
    ],
  },
];
