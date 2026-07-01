"""Avatar adapter — bring a face to life.

Engines (see docs/TECH_STACK.md):
  * LivePortrait — one photo → animated portrait; we pre-render an *idle loop*
      (blinks, micro-movements) + a *viseme bank* (mouth shapes) per persona,
      so the phone can lip-sync any audio instantly with zero server round-trip.
      https://github.com/KwaiVGI/LivePortrait
  * EchoMimicV3 — audio-driven full renders for "video message" replies.
      https://github.com/antgroup/echomimic_v3
  * Hallo2 — long-duration/high-res renders: time capsules, memorial films.
  * LiveAvatar (v2 target) — real-time streaming conversation video.
"""

from dataclasses import dataclass


@dataclass
class AvatarRig:
    ref: str              # storage key of rig bundle (idle loop + viseme bank)
    source_photo: str
    resolution: tuple[int, int]


def build_rig(portrait_paths: list[str]) -> AvatarRig:
    """Select the best frontal portrait (sharpness, pose, expression), then
    pre-render the idle loop and viseme bank with LivePortrait.

    For departed people, old/damaged photos go through restoration
    (GFPGAN-class) first — with an honest 'restored' badge in the UI."""
    raise NotImplementedError("wire to LivePortrait worker")


def render_reply(rig: AvatarRig, audio: bytes) -> str:
    """Async full render of a spoken reply (EchoMimicV3). Returns storage ref.
    Used for video messages and legacy-rule avatar delivery."""
    raise NotImplementedError("wire to EchoMimicV3 worker")


def render_longform(rig: AvatarRig, audio: bytes, *, hd: bool = True) -> str:
    """Time capsules & memorial films (Hallo2)."""
    raise NotImplementedError("wire to Hallo2 worker")
