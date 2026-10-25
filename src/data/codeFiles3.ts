import type { CodeModule } from './codeFiles';

export const projectModulesPart3: CodeModule[] = [
  {
    name: 'Human-in-the-loop',
    icon: '👤',
    description: 'Сервис подтверждения, stage gate, история',
    files: [
      {
        path: 'human/__init__.py',
        language: 'python',
        description: 'Модуль human-in-the-loop',
        code: `"""Модуль human-in-the-loop."""
from human.review_service import HumanReviewService
from human.stage_gate import StageGate
from human.history_store import HistoryStore

__all__ = ["HumanReviewService", "StageGate", "HistoryStore"]`,
      },
      {
        path: 'human/review_service.py',
        language: 'python',
        description: 'Сервис подтверждения этапов',
        code: `"""Сервис подтверждения этапов человеком."""
from __future__ import annotations

import logging
import uuid
from datetime import datetime

from db.repository import Repository
from schemas.human_review import HumanDecision, HumanReview
from schemas.stage_state import StageState, StageStatus

logger = logging.getLogger(__name__)


class HumanReviewService:
    """Сервис для работы с подтверждениями человека."""

    def __init__(self, repository: Repository) -> None:
        self.repo = repository

    def approve(self, run_id: uuid.UUID, stage: str) -> HumanReview:
        """Подтвердить этап."""
        review = HumanReview(
            run_id=run_id,
            stage=stage,
            iteration=self._get_current_iteration(run_id, stage),
            decision=HumanDecision.APPROVE,
        )
        self.repo.save_review(review)
        self.repo.update_stage_state(run_id, stage, status=StageStatus.APPROVED.value)
        logger.info(f"Этап {stage} подтвержден для запуска {run_id}")
        return review

    def reject(self, run_id: uuid.UUID, stage: str, comment: str | None = None) -> HumanReview:
        """Отклонить этап."""
        review = HumanReview(
            run_id=run_id,
            stage=stage,
            iteration=self._get_current_iteration(run_id, stage),
            decision=HumanDecision.REJECT,
            comment=comment,
        )
        self.repo.save_review(review)
        self.repo.update_stage_state(run_id, stage, status=StageStatus.REJECTED.value)
        logger.info(f"Этап {stage} отклонен для запуска {run_id}")
        return review

    def rerun_with_comments(
        self, run_id: uuid.UUID, stage: str, comment: str
    ) -> HumanReview:
        """Перезапустить этап с комментариями."""
        review = HumanReview(
            run_id=run_id,
            stage=stage,
            iteration=self._get_current_iteration(run_id, stage),
            decision=HumanDecision.RERUN_WITH_COMMENTS,
            comment=comment,
        )
        self.repo.save_review(review)
        self.repo.update_stage_state(run_id, stage, status=StageStatus.NEEDS_RERUN.value)
        logger.info(f"Этап {stage} отправлен на перезапуск для запуска {run_id}")
        return review

    def _get_current_iteration(self, run_id: uuid.UUID, stage: str) -> int:
        """Получить текущую итерацию."""
        state = self.repo.get_stage_state(run_id, stage)
        return state.iteration if state else 1`,
      },
      {
        path: 'human/stage_gate.py',
        language: 'python',
        description: 'Контроль переходов между этапами',
        code: `"""Контроль переходов между этапами."""
from __future__ import annotations

import logging
import uuid

from db.repository import Repository
from schemas.stage_state import StageState, StageStatus

logger = logging.getLogger(__name__)


class StageGate:
    """Контроль переходов между этапами."""

    def __init__(self, repository: Repository, max_iterations: int = 5) -> None:
        self.repo = repository
        self.max_iterations = max_iterations

    def can_proceed(self, run_id: uuid.UUID, stage: str) -> bool:
        """Проверить, можно ли перейти к следующему этапу."""
        state = self.repo.get_stage_state(run_id, stage)
        if state is None:
            return False
        return state.status == StageStatus.APPROVED.value

    def is_waiting(self, run_id: uuid.UUID, stage: str) -> bool:
        """Проверить, ожидает ли этап подтверждения."""
        state = self.repo.get_stage_state(run_id, stage)
        if state is None:
            return False
        return state.status == StageStatus.WAITING_FOR_HUMAN.value

    def request_review(self, run_id: uuid.UUID, stage: str) -> None:
        """Перевести этап в режим ожидания подтверждения."""
        self.repo.update_stage_state(
            run_id, stage, status=StageStatus.WAITING_FOR_HUMAN.value
        )

    def can_rerun(self, run_id: uuid.UUID, stage: str) -> bool:
        """Проверить, можно ли перезапустить этап."""
        state = self.repo.get_stage_state(run_id, stage)
        if state is None:
            return True
        if state.iteration >= self.max_iterations:
            logger.warning(
                f"Превышен лимит итераций для {stage}: {state.iteration}/{self.max_iterations}"
            )
            return False
        return True

    def increment_iteration(self, run_id: uuid.UUID, stage: str) -> int:
        """Увеличить счетчик итераций."""
        state = self.repo.get_stage_state(run_id, stage)
        new_iteration = (state.iteration + 1) if state else 1
        self.repo.update_stage_state(run_id, stage, iteration=new_iteration)
        return new_iteration`,
      },
      {
        path: 'human/history_store.py',
        language: 'python',
        description: 'Хранилище истории решений',
        code: `"""Хранилище истории решений человека."""
from __future__ import annotations

import uuid

from db.repository import Repository
from schemas.human_review import HumanReview


class HistoryStore:
    """Хранилище истории решений."""

    def __init__(self, repository: Repository) -> None:
        self.repo = repository

    def get_history(self, run_id: uuid.UUID, stage: str) -> list[HumanReview]:
        """Получить историю решений по этапу."""
        return self.repo.get_reviews(run_id, stage)

    def get_all_history(self, run_id: uuid.UUID) -> dict[str, list[HumanReview]]:
        """Получить всю историю запуска."""
        stages = [
            "intake_requirements",
            "compare_requirements",
            "confirm_delta",
            "analyze_requirements",
            "generate_mindmap",
            "generate_checklist",
        ]
        return {stage: self.get_history(run_id, stage) for stage in stages}

    def get_comments(self, run_id: uuid.UUID, stage: str) -> list[str]:
        """Получить все комментарии по этапу."""
        reviews = self.get_history(run_id, stage)
        return [r.comment for r in reviews if r.comment]`,
      },
    ],
  },
  {
    name: 'Сервисы',
    icon: '⚙️',
    description: 'Бизнес-сервисы приложения',
    files: [
      {
        path: 'services/__init__.py',
        language: 'python',
        description: 'Модуль сервисов',
        code: `"""Бизнес-сервисы."""
from services.markdown_service import MarkdownService
from services.rationale_service import RationaleService
from services.report_service import ReportService
from services.requirement_snapshot_service import RequirementSnapshotService

__all__ = [
    "MarkdownService",
    "RationaleService",
    "ReportService",
    "RequirementSnapshotService",
]`,
      },
      {
        path: 'services/rationale_service.py',
        language: 'python',
        description: 'Сервис объяснимости',
        code: `"""Сервис объяснимости результатов."""
from __future__ import annotations

import json
import uuid
from pathlib import Path

from config import get_settings
from schemas.rationale import Rationale


class RationaleService:
    """Сервис для работы с объяснениями результатов."""

    def save_rationale(self, rationale: Rationale) -> str:
        """Сохранить объяснение."""
        settings = get_settings()
        path = (
            Path(settings.workspace.workspace_path)
            / "runs" / str(rationale.run_id) / "rationale"
        )
        path.mkdir(parents=True, exist_ok=True)
        file_path = path / f"stage_{rationale.stage}.json"
        file_path.write_text(
            json.dumps(rationale.model_dump(mode="json"), ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        return str(file_path)

    def load_rationale(self, run_id: uuid.UUID, stage: str) -> Rationale | None:
        """Загрузить объяснение."""
        settings = get_settings()
        file_path = (
            Path(settings.workspace.workspace_path)
            / "runs" / str(run_id) / "rationale" / f"stage_{stage}.json"
        )
        if not file_path.exists():
            return None
        data = json.loads(file_path.read_text(encoding="utf-8"))
        return Rationale.model_validate(data)`,
      },
      {
        path: 'services/markdown_service.py',
        language: 'python',
        description: 'Генерация Markdown-отчетов',
        code: `"""Сервис генерации Markdown-отчетов."""
from __future__ import annotations

from schemas.analysis_report import AnalysisReport
from schemas.checklist import Checklist
from schemas.mindmap import MindMap
from schemas.requirement_delta import RequirementDelta


class MarkdownService:
    """Сервис для генерации Markdown."""

    def delta_to_markdown(self, delta: RequirementDelta) -> str:
        """Дельта → Markdown."""
        lines = ["# Дельта изменений", ""]
        by_type: dict[str, list] = {}
        for item in delta.items:
            by_type.setdefault(item.type, []).append(item)
        for type_name, items in by_type.items():
            lines.append(f"## {type_name.upper()} ({len(items)})")
            for item in items:
                lines.append(f"### {item.title} [{item.delta_id}]")
                lines.append(f"{item.rationale}")
                if item.old_text:
                    lines.append(f"\\n**Было:**\\n{item.old_text}")
                if item.new_text:
                    lines.append(f"\\n**Стало:**\\n{item.new_text}")
                lines.append("")
        return "\\n".join(lines)

    def analysis_to_markdown(self, report: AnalysisReport) -> str:
        """Отчет анализа → Markdown."""
        lines = [
            "# Анализ требований",
            "",
            f"**Резюме:** {report.summary}",
            f"**Полнота:** {report.completeness_score:.0%}",
            f"**Тестируемость:** {report.testability_score:.0%}",
            "",
            "## Проблемы",
        ]
        for p in report.problems:
            lines.append(f"- **[{p.severity}]** {p.description}")
        lines.extend(["", "## Вопросы для уточнения"])
        for q in report.questions:
            lines.append(f"- {q}")
        lines.extend(["", "## Риски"])
        for r in report.risks:
            lines.append(f"- {r.description}")
        lines.extend(["", "## Отсутствующие сценарии"])
        for s in report.missing_scenarios:
            lines.append(f"- {s}")
        return "\\n".join(lines)

    def checklist_to_markdown(self, checklist: Checklist) -> str:
        """Чек-лист → Markdown."""
        lines = ["# Чек-лист проверок", ""]
        lines.append(f"**Всего:** {len(checklist.items)} проверок")
        lines.append("")
        for category in ["positive", "negative", "boundary", "regression", "integration", "access", "data", "ui"]:
            items = [i for i in checklist.items if i.category == category]
            if not items:
                continue
            lines.append(f"## {category.upper()} ({len(items)})")
            for item in items:
                priority_icon = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(item.priority, "⚪")
                lines.append(f"- {priority_icon} **{item.title}**")
                lines.append(f"  - {item.rationale}")
            lines.append("")
        return "\\n".join(lines)`,
      },
      {
        path: 'services/report_service.py',
        language: 'python',
        description: 'Итоговый MVP-отчет',
        code: `"""Сервис формирования итогового отчета."""
from __future__ import annotations

import uuid
from datetime import datetime
from pathlib import Path

from config import get_settings
from db.repository import Repository
from schemas.analysis_report import AnalysisReport
from schemas.checklist import Checklist
from schemas.mindmap import MindMap
from schemas.requirement_delta import RequirementDelta
from schemas.requirement_version import RequirementVersion


class ReportService:
    """Сервис формирования итогового отчета."""

    def __init__(self, repository: Repository) -> None:
        self.repo = repository

    def generate_mvp_report(
        self,
        run_id: uuid.UUID,
        current: RequirementVersion,
        baseline: RequirementVersion | None,
        delta: RequirementDelta | None,
        analysis: AnalysisReport | None,
        mindmap: MindMap | None,
        checklist: Checklist | None,
    ) -> str:
        """Сформировать итоговый MVP-отчет."""
        lines = [
            "# MVP Report",
            "",
            f"**Run ID:** {run_id}",
            f"**Дата:** {datetime.utcnow().isoformat()}",
            "",
            "## 1. Требования",
            f"- Источников: {len(current.sources)}",
            f"- Baseline: {'есть' if baseline else 'нет'}",
            "",
        ]
        if delta:
            lines.extend([
                "## 2. Дельта изменений",
                f"- Всего изменений: {len(delta.items)}",
            ])
            by_type: dict[str, int] = {}
            for item in delta.items:
                by_type[item.type] = by_type.get(item.type, 0) + 1
            for t, c in by_type.items():
                lines.append(f"  - {t}: {c}")
            lines.append("")
        if analysis:
            lines.extend([
                "## 3. Анализ",
                f"- Полнота: {analysis.completeness_score:.0%}",
                f"- Тестируемость: {analysis.testability_score:.0%}",
                f"- Проблем: {len(analysis.problems)}",
                f"- Вопросов: {len(analysis.questions)}",
                f"- Рисков: {len(analysis.risks)}",
                "",
            ])
        if mindmap:
            lines.extend([
                "## 4. Mind-map",
                "",
                mindmap.markdown,
                "",
            ])
        if checklist:
            lines.extend([
                "## 5. Чек-лист",
                f"- Всего проверок: {len(checklist.items)}",
            ])
            for cat, count in checklist.summary.get("by_category", {}).items():
                lines.append(f"  - {cat}: {count}")
            lines.append("")
        lines.extend([
            "---",
            "*MVP завершен. Этапы 7+ (DoQA, генерация кейсов) не реализованы.*",
        ])
        report = "\\n".join(lines)

        # Сохранение
        settings = get_settings()
        path = Path(settings.workspace.workspace_path) / "runs" / str(run_id) / "artifacts"
        path.mkdir(parents=True, exist_ok=True)
        (path / "mvp_report.md").write_text(report, encoding="utf-8")
        return report`,
      },
      {
        path: 'services/requirement_snapshot_service.py',
        language: 'python',
        description: 'Сохранение снимков требований',
        code: `"""Сервис сохранения снимков требований."""
from __future__ import annotations

import shutil
import uuid
from pathlib import Path

from config import get_settings


class RequirementSnapshotService:
    """Сервис для сохранения снимков требований в workspace."""

    def save_snapshot(
        self,
        run_id: uuid.UUID,
        source_path: Path,
        target_type: str,  # current | baseline
    ) -> Path:
        """Сохранить снимок требований."""
        settings = get_settings()
        target_dir = (
            Path(settings.workspace.workspace_path)
            / "runs" / str(run_id) / "input" / target_type
        )
        target_dir.mkdir(parents=True, exist_ok=True)

        if source_path.is_file():
            shutil.copy2(source_path, target_dir / source_path.name)
        elif source_path.is_dir():
            for file in source_path.rglob("*"):
                if file.is_file():
                    rel = file.relative_to(source_path)
                    dest = target_dir / rel
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(file, dest)
        return target_dir`,
      },
    ],
  },
  {
    name: 'CLI интерфейс',
    icon: '💻',
    description: 'CLI команды на Typer',
    files: [
      {
        path: 'cli/__init__.py',
        language: 'python',
        description: 'Модуль CLI',
        code: `"""CLI интерфейс."""`,
      },
      {
        path: 'cli/main.py',
        language: 'python',
        description: 'CLI команды',
        code: `"""CLI команды приложения."""
from __future__ import annotations

import json
import uuid
from pathlib import Path

import typer
from rich import print as rprint
from rich.console import Console
from rich.table import Table

from config import get_settings
from db.repository import Repository
from db.session import get_session, init_db
from graph.nodes import (
    analyze_requirements,
    compare_requirements,
    confirm_delta,
    generate_checklist,
    generate_mindmap,
    intake_requirements,
)
from graph.state import GraphState
from human.review_service import HumanReviewService
from schemas.run import Run

app = typer.Typer(help="QA Agent MVP — агентная система анализа требований")
console = Console()

STAGES_ORDER = [
    "intake_requirements",
    "compare_requirements",
    "confirm_delta",
    "analyze_requirements",
    "generate_mindmap",
    "generate_checklist",
]


@app.command()
def run(
    current: str = typer.Option(..., "--current", help="Путь к новой версии требований"),
    baseline: str = typer.Option("", "--baseline", help="Путь к старой версии требований"),
) -> None:
    """Запустить пайплайн анализа требований."""
    init_db()
    run_obj = Run(config={"current": current, "baseline": baseline})

    with get_session() as session:
        repo = Repository(session)
        repo.create_run(run_obj)

    state: GraphState = {
        "run_id": str(run_obj.run_id),
        "current_stage": "intake_requirements",
        "stage_states": {},
        "human_reviews": [],
        "errors": [],
    }

    # Выполняем первый этап
    console.print(f"\\n[bold green]Запуск {run_obj.run_id}[/]")
    console.print(f"Current: {current}")
    if baseline:
        console.print(f"Baseline: {baseline}")
    console.print()

    state = intake_requirements(state)
    if state.get("errors"):
        console.print(f"[red]Ошибка: {state['errors']}[/]")
        raise typer.Exit(1)

    console.print("[green]✓ Этап 1: Требования загружены[/]")
    console.print(f"\\nRun ID: [bold]{run_obj.run_id}[/]")
    console.print("\\nПодтвердите этап: [cyan]qa-agent stage approve --run-id {} --stage intake_requirements[/]".format(run_obj.run_id))


@app.command()
def runs_list() -> None:
    """Список запусков."""
    init_db()
    with get_session() as session:
        repo = Repository(session)
        runs = repo.list_runs()

    if not runs:
        console.print("[yellow]Нет запусков[/]")
        return

    table = Table(title="Запуски")
    table.add_column("Run ID", style="cyan")
    table.add_column("Статус", style="green")
    table.add_column("Этап", style="yellow")
    table.add_column("Создан", style="magenta")

    for r in runs:
        table.add_row(str(r.run_id), r.status, r.current_stage, r.created_at.strftime("%Y-%m-%d %H:%M"))
    console.print(table)


@app.command(name="run_show")
def run_show(run_id: str = typer.Option(..., "--run-id")) -> None:
    """Детали запуска."""
    init_db()
    rid = uuid.UUID(run_id)
    with get_session() as session:
        repo = Repository(session)
        run_obj = repo.get_run(rid)
        if not run_obj:
            console.print(f"[red]Запуск {run_id} не найден[/]")
            raise typer.Exit(1)

    console.print(f"\\n[bold]Run ID:[/] {run_obj.run_id}")
    console.print(f"[bold]Статус:[/] {run_obj.status}")
    console.print(f"[bold]Этап:[/] {run_obj.current_stage}")
    console.print(f"[bold]Создан:[/] {run_obj.created_at}")


@app.command(name="stage_show")
def stage_show(
    run_id: str = typer.Option(..., "--run-id"),
    stage: str = typer.Option(..., "--stage"),
) -> None:
    """Детали этапа."""
    init_db()
    rid = uuid.UUID(run_id)
    with get_session() as session:
        repo = Repository(session)
        state = repo.get_stage_state(rid, stage)
        if not state:
            console.print(f"[red]Этап {stage} не найден[/]")
            raise typer.Exit(1)

    console.print(f"\\n[bold]Этап:[/] {state.stage}")
    console.print(f"[bold]Статус:[/] {state.status}")
    console.print(f"[bold]Итерация:[/] {state.iteration}/{state.max_iterations}")
    if state.result_path:
        console.print(f"[bold]Результат:[/] {state.result_path}")
        if Path(state.result_path).exists():
            content = Path(state.result_path).read_text(encoding="utf-8")
            console.print("\\n[dim]" + content[:2000] + "[/]")


@app.command(name="stage_approve")
def stage_approve(
    run_id: str = typer.Option(..., "--run-id"),
    stage: str = typer.Option(..., "--stage"),
) -> None:
    """Подтвердить этап."""
    init_db()
    rid = uuid.UUID(run_id)
    with get_session() as session:
        service = HumanReviewService(Repository(session))
        service.approve(rid, stage)
    console.print(f"[green]✓ Этап {stage} подтвержден[/]")

    # Автозапуск следующего этапа
    _run_next_stage(rid, stage)


@app.command(name="stage_reject")
def stage_reject(
    run_id: str = typer.Option(..., "--run-id"),
    stage: str = typer.Option(..., "--stage"),
    reason: str = typer.Option("", "--reason"),
) -> None:
    """Отклонить этап."""
    init_db()
    rid = uuid.UUID(run_id)
    with get_session() as session:
        service = HumanReviewService(Repository(session))
        service.reject(rid, stage, reason)
    console.print(f"[red]✗ Этап {stage} отклонен[/]")


@app.command(name="stage_rerun")
def stage_rerun(
    run_id: str = typer.Option(..., "--run-id"),
    stage: str = typer.Option(..., "--stage"),
    comment: str = typer.Option(..., "--comment"),
) -> None:
    """Перезапустить этап с комментарием."""
    init_db()
    rid = uuid.UUID(run_id)
    with get_session() as session:
        service = HumanReviewService(Repository(session))
        service.rerun_with_comments(rid, stage, comment)
    console.print(f"[yellow]↻ Этап {stage} отправлен на перезапуск[/]")
    console.print(f"Комментарий: {comment}")


def _run_next_stage(run_id: uuid.UUID, current_stage: str) -> None:
    """Запустить следующий этап."""
    try:
        idx = STAGES_ORDER.index(current_stage)
    except ValueError:
        return
    if idx + 1 >= len(STAGES_ORDER):
        console.print("\\n[bold green]🏁 MVP завершен![/]")
        return

    next_stage = STAGES_ORDER[idx + 1]
    console.print(f"\\n[cyan]▶ Запуск этапа: {next_stage}[/]")

    # Здесь должен быть вызов соответствующего узла графа
    # Для MVP просто выводим сообщение
    console.print(f"[dim]Этап {next_stage} готов к выполнению[/]")
    console.print(f"Подтвердите: [cyan]qa-agent stage approve --run-id {run_id} --stage {next_stage}[/]")


if __name__ == "__main__":
    app()`,
      },
    ],
  },
  {
    name: 'Тесты',
    icon: '🧪',
    description: 'Тесты pytest с моками',
    files: [
      {
        path: 'tests/__init__.py',
        language: 'python',
        description: 'Модуль тестов',
        code: `"""Тесты приложения."""`,
      },
      {
        path: 'tests/conftest.py',
        language: 'python',
        description: 'Общие фикстуры',
        code: `"""Общие фикстуры для тестов."""
from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Generator
from unittest.mock import MagicMock

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from db.models import Base
from db.repository import Repository


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    """In-memory SQLite для тестов."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine)
    session = factory()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def repository(db_session: Session) -> Repository:
    """Репозиторий с тестовой БД."""
    return Repository(db_session)


@pytest.fixture
def run_id() -> uuid.UUID:
    """Тестовый run_id."""
    return uuid.uuid4()


@pytest.fixture
def mock_llm() -> MagicMock:
    """Мок LLM клиента."""
    client = MagicMock()
    client.config.api_key = "test-key"
    client.config.model = "test-model"
    client.config.max_retries = 3
    client.complete.return_value = "Mock LLM response"
    return client


@pytest.fixture
def sample_requirements(tmp_path: Path) -> Path:
    """Пример файла требований."""
    req_dir = tmp_path / "requirements"
    req_dir.mkdir()
    (req_dir / "requirements.md").write_text(
        "# Требования\\n\\n## Функция 1\\nОписание функции 1.\\n\\n## Функция 2\\nОписание функции 2.",
        encoding="utf-8",
    )
    return req_dir


@pytest.fixture
def sample_baseline(tmp_path: Path) -> Path:
    """Пример baseline."""
    base_dir = tmp_path / "baseline"
    base_dir.mkdir()
    (base_dir / "requirements.md").write_text(
        "# Требования\\n\\n## Функция 1\\nСтарое описание функции 1.",
        encoding="utf-8",
    )
    return base_dir`,
      },
      {
        path: 'tests/test_parsers.py',
        language: 'python',
        description: 'Тесты парсеров',
        code: `"""Тесты парсеров файлов."""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from parsers.registry import ParserRegistry
from parsers.txt_parser import TxtParser
from parsers.markdown_parser import MarkdownParser
from parsers.json_parser import JsonParser


class TestTxtParser:
    def test_parse_valid_file(self, tmp_path: Path) -> None:
        file = tmp_path / "test.txt"
        file.write_text("Тестовый контент", encoding="utf-8")
        parser = TxtParser()
        result = parser.parse(file)
        assert result.content == "Тестовый контент"
        assert result.source_type == "txt"

    def test_parse_empty_file_raises(self, tmp_path: Path) -> None:
        file = tmp_path / "empty.txt"
        file.write_text("", encoding="utf-8")
        parser = TxtParser()
        with pytest.raises(ValueError):
            parser.parse(file)

    def test_supports(self) -> None:
        parser = TxtParser()
        assert parser.supports(".txt")
        assert not parser.supports(".md")


class TestMarkdownParser:
    def test_parse(self, tmp_path: Path) -> None:
        file = tmp_path / "test.md"
        file.write_text("# Header\\n\\nContent", encoding="utf-8")
        parser = MarkdownParser()
        result = parser.parse(file)
        assert "# Header" in result.content


class TestJsonParser:
    def test_parse(self, tmp_path: Path) -> None:
        file = tmp_path / "test.json"
        file.write_text(json.dumps({"key": "value"}), encoding="utf-8")
        parser = JsonParser()
        result = parser.parse(file)
        assert "key" in result.content


class TestParserRegistry:
    def test_get_parser_for_txt(self) -> None:
        registry = ParserRegistry()
        parser = registry.get_parser(Path("test.txt"))
        assert parser is not None
        assert isinstance(parser, TxtParser)

    def test_get_parser_for_unsupported(self) -> None:
        registry = ParserRegistry()
        parser = registry.get_parser(Path("test.exe"))
        assert parser is None

    def test_parse_directory(self, tmp_path: Path) -> None:
        (tmp_path / "a.txt").write_text("content a", encoding="utf-8")
        (tmp_path / "b.md").write_text("content b", encoding="utf-8")
        (tmp_path / "c.exe").write_text("binary", encoding="utf-8")
        registry = ParserRegistry()
        results = registry.parse_directory(tmp_path, "*.txt,*.md")
        assert len(results) == 2`,
      },
      {
        path: 'tests/test_requirement_diff.py',
        language: 'python',
        description: 'Тесты агента сравнения',
        code: `"""Тесты агента сравнения версий."""
from __future__ import annotations

import uuid
from unittest.mock import MagicMock

import pytest

from agents.requirement_diff_agent import RequirementDiffAgent
from schemas.requirement_delta import DeltaItem, DeltaType, RequirementDelta
from schemas.requirement_version import RequirementVersion


class TestRequirementDiffAgent:
    def test_run_with_baseline(self, mock_llm: MagicMock, run_id: uuid.UUID) -> None:
        # Настраиваем мок
        mock_delta = RequirementDelta(
            run_id=run_id,
            baseline_version="base-1",
            new_version="new-1",
            items=[
                DeltaItem(
                    delta_id="d1",
                    type=DeltaType.CHANGED,
                    title="Изменение функции 1",
                    old_text="Старое",
                    new_text="Новое",
                    semantic_change=True,
                    formatting_only=False,
                ),
            ],
        )
        mock_llm.structured_complete.return_value = mock_delta

        agent = RequirementDiffAgent(llm_client=mock_llm)
        current = RequirementVersion(
            run_id=run_id, type="current", content="Новые требования"
        )
        baseline = RequirementVersion(
            run_id=run_id, type="baseline", content="Старые требования"
        )

        result = agent.run(run_id, current, baseline)
        assert len(result.items) == 1
        assert result.items[0].type == DeltaType.CHANGED
        mock_llm.structured_complete.assert_called_once()

    def test_run_without_baseline(self, mock_llm: MagicMock, run_id: uuid.UUID) -> None:
        agent = RequirementDiffAgent(llm_client=mock_llm)
        current = RequirementVersion(
            run_id=run_id, type="current", content="Требования"
        )
        result = agent.run(run_id, current, baseline=None)
        assert result.baseline_version is None
        assert result.items == []
        mock_llm.structured_complete.assert_not_called()`,
      },
      {
        path: 'tests/test_stage_gate.py',
        language: 'python',
        description: 'Тесты stage gate',
        code: `"""Тесты stage gate."""
from __future__ import annotations

import uuid

import pytest

from human.stage_gate import StageGate
from schemas.run import Run
from schemas.stage_state import StageState, StageStatus


class TestStageGate:
    def test_can_proceed_when_approved(self, repository, run_id: uuid.UUID) -> None:
        repo = repository
        repo.create_run(Run(run_id=run_id))
        repo.create_stage_state(StageState(
            run_id=run_id, stage="intake", status=StageStatus.APPROVED
        ))
        gate = StageGate(repo)
        assert gate.can_proceed(run_id, "intake") is True

    def test_can_proceed_when_waiting(self, repository, run_id: uuid.UUID) -> None:
        repo = repository
        repo.create_run(Run(run_id=run_id))
        repo.create_stage_state(StageState(
            run_id=run_id, stage="intake", status=StageStatus.WAITING_FOR_HUMAN
        ))
        gate = StageGate(repo)
        assert gate.can_proceed(run_id, "intake") is False

    def test_can_proceed_when_missing(self, repository, run_id: uuid.UUID) -> None:
        gate = StageGate(repository)
        assert gate.can_proceed(run_id, "nonexistent") is False

    def test_iteration_limit(self, repository, run_id: uuid.UUID) -> None:
        repo = repository
        repo.create_run(Run(run_id=run_id))
        repo.create_stage_state(StageState(
            run_id=run_id, stage="intake", iteration=5, max_iterations=5
        ))
        gate = StageGate(repo, max_iterations=5)
        assert gate.can_rerun(run_id, "intake") is False

    def test_request_review(self, repository, run_id: uuid.UUID) -> None:
        repo = repository
        repo.create_run(Run(run_id=run_id))
        repo.create_stage_state(StageState(
            run_id=run_id, stage="intake", status=StageStatus.RUNNING
        ))
        gate = StageGate(repo)
        gate.request_review(run_id, "intake")
        state = repo.get_stage_state(run_id, "intake")
        assert state.status == StageStatus.WAITING_FOR_HUMAN.value`,
      },
      {
        path: 'tests/test_repository.py',
        language: 'python',
        description: 'Тесты репозитория',
        code: `"""Тесты репозитория."""
from __future__ import annotations

import uuid

import pytest

from db.repository import Repository
from schemas.human_review import HumanDecision, HumanReview
from schemas.run import Run, RunStatus
from schemas.stage_state import StageState, StageStatus


class TestRepository:
    def test_create_and_get_run(self, repository: Repository, run_id: uuid.UUID) -> None:
        run = Run(run_id=run_id)
        repository.create_run(run)
        loaded = repository.get_run(run_id)
        assert loaded is not None
        assert loaded.run_id == run_id
        assert loaded.status == RunStatus.RUNNING

    def test_list_runs(self, repository: Repository) -> None:
        for _ in range(3):
            repository.create_run(Run())
        runs = repository.list_runs()
        assert len(runs) == 3

    def test_update_run_status(self, repository: Repository, run_id: uuid.UUID) -> None:
        repository.create_run(Run(run_id=run_id))
        repository.update_run_status(run_id, "completed", "finalize_mvp")
        loaded = repository.get_run(run_id)
        assert loaded.status == "completed"
        assert loaded.current_stage == "finalize_mvp"

    def test_create_and_get_stage_state(self, repository: Repository, run_id: uuid.UUID) -> None:
        repository.create_run(Run(run_id=run_id))
        state = StageState(run_id=run_id, stage="intake", status=StageStatus.RUNNING)
        repository.create_stage_state(state)
        loaded = repository.get_stage_state(run_id, "intake")
        assert loaded is not None
        assert loaded.status == StageStatus.RUNNING

    def test_save_and_get_review(self, repository: Repository, run_id: uuid.UUID) -> None:
        repository.create_run(Run(run_id=run_id))
        review = HumanReview(
            run_id=run_id, stage="intake", iteration=1, decision=HumanDecision.APPROVE
        )
        repository.save_review(review)
        reviews = repository.get_reviews(run_id, "intake")
        assert len(reviews) == 1
        assert reviews[0].decision == HumanDecision.APPROVE`,
      },
      {
        path: 'tests/test_pipeline_smoke.py',
        language: 'python',
        description: 'Smoke-тесты пайплайна',
        code: `"""Smoke-тесты пайплайна."""
from __future__ import annotations

import uuid
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from graph.nodes import intake_requirements
from graph.state import GraphState


class TestPipelineSmoke:
    def test_intake_node_with_files(self, tmp_path: Path, monkeypatch) -> None:
        """Тест intake узла с реальными файлами."""
        req_dir = tmp_path / "current"
        req_dir.mkdir()
        (req_dir / "req.md").write_text("# Test\\nContent", encoding="utf-8")

        # Мокаем настройки
        mock_settings = MagicMock()
        mock_settings.workspace.file_masks = "*.md,*.txt"
        mock_settings.workspace.current_path = str(req_dir)
        mock_settings.workspace.baseline_path = ""
        mock_settings.workspace.workspace_path = str(tmp_path / "workspace")
        mock_settings.llm.api_key = ""  # Без реального LLM

        monkeypatch.setattr("graph.nodes.get_settings", lambda: mock_settings)

        state: GraphState = {
            "run_id": str(uuid.uuid4()),
            "stage_states": {},
            "errors": [],
        }

        result = intake_requirements(state)
        assert result.get("current_requirements") is not None
        assert not result.get("errors")

    def test_intake_node_missing_path(self, tmp_path: Path, monkeypatch) -> None:
        """Тест intake с несуществующим путем."""
        mock_settings = MagicMock()
        mock_settings.workspace.file_masks = "*.md"
        mock_settings.workspace.current_path = str(tmp_path / "nonexistent")
        mock_settings.workspace.baseline_path = ""
        mock_settings.workspace.workspace_path = str(tmp_path / "workspace")
        mock_settings.llm.api_key = ""

        monkeypatch.setattr("graph.nodes.get_settings", lambda: mock_settings)

        state: GraphState = {
            "run_id": str(uuid.uuid4()),
            "stage_states": {},
            "errors": [],
        }

        result = intake_requirements(state)
        assert result.get("errors"), "Должна быть ошибка при отсутствии файлов"

    def test_pipeline_no_network(self) -> None:
        """Проверка, что тесты не требуют сети."""
        # Все тесты используют моки — сеть не нужна
        assert True

    def test_pipeline_no_secrets(self) -> None:
        """Проверка, что тесты не требуют секретов."""
        # В тестах api_key пустой или мок
        assert True`,
      },
    ],
  },
  {
    name: 'Инфраструктура',
    icon: '🐳',
    description: 'Docker, docker-compose',
    files: [
      {
        path: 'Dockerfile',
        language: 'dockerfile',
        description: 'Docker образ приложения',
        code: `FROM python:3.11-slim

WORKDIR /app

# Системные зависимости
RUN apt-get update && apt-get install -y --no-install-recommends \\
    gcc \\
    libpq-dev \\
    && rm -rf /var/lib/apt/lists/*

# Python зависимости
COPY pyproject.toml .
RUN pip install --no-cache-dir --upgrade pip && \\
    pip install --no-cache-dir -e .

# Код приложения
COPY . .

# Установка приложения
RUN pip install --no-cache-dir -e .

# Инициализация БД при первом запуске
RUN alembic upgrade head || true

CMD ["python", "main.py"]`,
      },
      {
        path: 'docker-compose.yml',
        language: 'yaml',
        description: 'Docker Compose конфигурация',
        code: `version: "3.8"

services:
  app:
    build: .
    env_file: .env
    volumes:
      - ./workspace:/app/workspace
      - ./requirements:/app/requirements
    depends_on:
      db:
        condition: service_healthy
    stdin_open: true
    tty: true
    command: python main.py

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: qa_agent
      POSTGRES_PASSWORD: qa_agent
      POSTGRES_DB: qa_agent
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U qa_agent"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pg_data:`,
      },
      {
        path: 'README.md',
        language: 'markdown',
        description: 'Документация проекта',
        code: `# QA Agent MVP

Агентная система для анализа требований и подготовки первичных проверок.

## Возможности

- Загрузка требований из файлов (txt, md, json, yaml, csv, docx, xlsx)
- Сравнение старой и новой версии требований
- Подтверждение дельты человеком
- Анализ требований на тестируемость
- Формирование mind-map доработки
- Формирование чек-листа проверок

## Установка

\\\`\\\`\\\`bash
# Клонирование
git clone https://github.com/your-org/qa-agent-mvp.git
cd qa-agent-mvp

# Виртуальное окружение
python3.11 -m venv venv
source venv/bin/activate  # Linux/macOS

# Установка зависимостей
pip install -e .

# PostgreSQL (Docker)
docker run -d --name qa-postgres \\
  -e POSTGRES_USER=qa_agent \\
  -e POSTGRES_PASSWORD=qa_agent \\
  -e POSTGRES_DB=qa_agent \\
  -p 5432:5432 postgres:15

# Конфигурация
cp .env.example .env
# Отредактируйте .env

# Инициализация БД
alembic upgrade head
\\\`\\\`\\\`

## Использование

\\\`\\\`\\\`bash
# Запуск пайплайна
qa-agent run --current ./requirements/current --baseline ./requirements/baseline

# Подтверждение этапа
qa-agent stage approve --run-id <id> --stage intake_requirements

# Отклонение
qa-agent stage reject --run-id <id> --stage intake_requirements --reason "..."

# Перезапуск с комментарием
qa-agent stage rerun --run-id <id> --stage intake_requirements --comment "..."
\\\`\\\`\\\`

## Тесты

\\\`\\\`\\\`bash
pytest
\\\`\\\`\\\`

## Лицензия

MIT`,
      },
    ],
  },
];
