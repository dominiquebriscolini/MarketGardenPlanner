"""Boundary for future integrations. No Rhino/Grasshopper dependency in phase 1.

Adapters will translate JSON-compatible input into domain objects and expose
dataclasses.asdict(result). Rhino 7 must call a separate Python 3.11 process
or service; its embedded IronPython must not import this Python 3.11 package.
"""
