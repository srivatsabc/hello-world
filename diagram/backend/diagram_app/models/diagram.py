# Date: October 1, 2026
# Name: Sri
# Desc: Shapes of the diagram payload: zones (dotted boundaries), nodes
#       (boxes), edges (arrows) and the step-by-step text for each flow.
#       Fields stay snake_case. Coordinates are in the diagram's own
#       1830 x 840 SVG space.
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel

Flow = Literal["conventional", "ai"]


class Zone(BaseModel):
    id: str
    x: int
    y: int
    w: int
    h: int
    tag: str
    tag2: str | None = None
    tag2_at: Literal["top", "bottom"] = "bottom"
    icon: str | None = None
    color: str
    flows: list[Flow]


class Node(BaseModel):
    id: str
    x: int
    y: int
    w: int
    h: int
    title: str
    sub: str | list[str] | None = None
    icon: str
    flows: list[Flow]
    big: bool = False
    chips: bool = False
    ghost: bool = False


class Edge(BaseModel):
    d: str
    flows: list[Flow]
    label: str | None = None
    lx: int | None = None
    ly: int | None = None
    anchor: Literal["start", "middle", "end"] | None = None


class Diagram(BaseModel):
    zones: list[Zone]
    nodes: list[Node]
    edges: list[Edge]
    steps: dict[Flow, list[str]]
    flow_titles: dict[Flow, str]
