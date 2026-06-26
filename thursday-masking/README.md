# Thursday: Masking & Anonymizing Audiovisual Data

**Instructor:** Babajide Owoyele (Radboud University / SYNAPSIS)

## Overview

This full-day session covers privacy-preserving techniques for behavioral research video. Participants will learn to mask (de-identify) video data using open-source tools, evaluate how masking affects downstream analysis, and make informed decisions about masking strategies for their own research.

## Running Dataset

We use the **triadic concept generation dataset** (CDR Stanford, Edelman 2011) as the primary hands-on example: 10 teams of 3 students collaboratively redesigning a product, recorded from multiple camera angles. This multi-person, gesture-rich data presents real-world masking challenges.

## Schedule

| Time | Session | Format |
|------|---------|--------|
| 09:00-09:30 | SYNAPSIS: Infrastructure for Privacy-Preserving Research | Lecture |
| 09:30-09:50 | The Triadic Concept Generation Dataset | Lecture |
| 09:50-10:30 | Why Mask? The Privacy-Utility Dilemma | Lecture + Discussion |
| 10:30-10:50 | Coffee Break | |
| 10:50-11:20 | Masking Operations Taxonomy | Lecture + Demo |
| 11:20-11:50 | Card Deck Exercise: Masking Strategy Selection | Group activity |
| 11:50-12:30 | MaskAnyone: Architecture & Hands-On I | Hands-on |
| 12:30-13:30 | Lunch | |
| 13:30-14:30 | MaskAnyone: Advanced Features & Hands-On II | Hands-on |
| 14:30-15:15 | MaskBench: Did Your Masking Break Your Data? | Hands-on |
| 15:15-15:35 | Coffee Break | |
| 15:35-16:05 | Bring-Your-Own-Video | Hands-on |
| 16:05-16:35 | Text De-identification: de-identify interview transcripts | Hands-on |
| 16:35-16:50 | Audio Masking & Multi-Modal Considerations | Demo |
| 16:50-17:00 | Wrap-Up & Integration with Group Projects | Discussion |

## Requirements

Participants need:
- A laptop with a modern web browser (Chrome or Firefox)
- WiFi access (provided)
- Optionally: Python 3.10+ for the MaskBench evaluation exercise

No GPU or Docker installation required -- all masking runs on a remote server via web interface.

## Tools

- **MaskAnyone** -- open-source video masking platform (YOLO + SAM2 + pose estimation)
- **MaskBench** -- benchmarking framework for evaluating masking quality
- **SYNAPSIS infrastructure** -- hosted on Radboud HPC (Ponyland)
- **SYNAPSIS Card Decks** -- Data Tarot (35 cards) + Masking Lab Deck (30 cards); see `card_deck_exercise.md`
- **spaCy + networkx + wordcloud** -- text de-identification pipeline; see `notebooks/06_text_deidentification.ipynb`

## Key References

- Owoyele et al. (2026). MaskingOPS: A Tutorial for Masking Operations in Behavioral Research. *Behavior Research Methods*. (under review)
- Owoyele, Riedel, Shaik et al. (2026). MaskBench: Privacy-Preserving Pose Estimation Benchmarking. *Behavior Research Methods*. (under review)
- Edelman, J. (2011). Understanding Radical Breaks: Media and Behavior in Small Teams Engaged in Redesign Scenarios. PhD dissertation, Stanford University.

## Connection to Other Days

| Day | Topic | Thursday Connection |
|-----|-------|---------------------|
| Monday | Motion tracking | Masking affects the tracking you learned |
| Tuesday | Acoustic analysis | Audio masking connects to prosodic analysis |
| Wednesday | Pose estimation | MaskBench evaluates pose on masked video |
| **Thursday** | **Masking & anonymization** | **This day** |
| Friday | Group projects | Incorporate masking into your project |
