# Before Thursday — prep checklist

Do this **before** the masking day so the hands-on blocks run smoothly. There are **two things to
set up**, and one of them has a GPU fork. Budget ~20–30 min the evening before (mostly downloads).

> TL;DR — set up **(1) the masking-lite notebook** on your laptop, and **(2) MaskAnyone**: use the
> hosted **pilot server** (<https://synapsis-dev.cls.ru.nl/> — ⚠️ **don't open until the instructor
> says it's live**), or self-host with Docker (GPU vs no-GPU
> is just which compose file). If in doubt, do the notebook — no GPU, no Docker, enough for the whole day.

---

## Track 1 · masking-lite notebook  *(everyone — CPU, no GPU, no Docker)*

The lightweight video-masking + audio notebooks run entirely on your laptop.

- [ ] Clone this repo: `git clone https://github.com/WimPouw/TilburgMultiscaleSummerschool2026`
- [ ] Follow **[`HANDS_ON_SETUP.md`](HANDS_ON_SETUP.md)** — one small conda/venv env (Python **3.9–3.12**, *not 3.13*).
- [ ] Open `notebooks/masking-lite.ipynb`, run it top to bottom once to confirm it works.
- [ ] **No install at all?** Open `notebooks/masking-lite.ipynb` in **Google Colab** and run it there.

This track is the fallback for everything: if MaskAnyone (Track 2) gives you trouble, the notebook
alone lets you follow the full mask → measure → decide arc.

---

## Track 2 · MaskAnyone — the full masking platform

MaskAnyone (YOLO + SAM2 + pose estimation, web UI) is the tool for the **11:20–12:05 hands-on**.
Pick **one** of the options below — easiest first.

### Option A · Hosted pilot server  *(easiest — nothing to install, recommended)*

SYNAPSIS runs a hosted MaskAnyone pilot on the Radboud CLS infrastructure. Just open it in your
browser — no Docker, no download, no GPU.

- [ ] Server: **<https://synapsis-dev.cls.ru.nl/>** — ⚠️ **do not open it yet.**

> **Not live for students yet.** The pilot is a **development server** with limited capacity — please
> **don't load the link until the instructor announces it's open** (on the day). Note it now; wait for
> the go-ahead before logging in. If it's unavailable when we get there, self-host with Option B.

### Option B · Self-host with Docker  *(run it on your own machine)*

Clone the production-infrastructure repo. Whether you need a GPU is simply **which compose file you
use** — same repo either way.

**Prerequisites**

- [ ] **Docker** installed and running — <https://docs.docker.com/get-docker/>
- [ ] **~50 GB free disk**.
- [ ] *GPU build only:* a **modern Nvidia GPU** + `nvidia-container-toolkit`.

**Clone and configure**

```bash
git clone https://github.com/MaskAnyone/MaskAnyoneProdInfrastructure.git maskanyone
cd maskanyone
cp .env.dist .env        # then edit .env and set <your-strong-password-1>
```

**Then pick the compose file for your hardware:**

```bash
# NO GPU — MediaPipe-based masking only (no SAM2 / OpenPose)
docker compose -f docker-compose-local.yml pull
docker compose -f docker-compose-local.yml up -d postgres      # wait ~10s
docker compose -f docker-compose-local.yml up -d

# GPU — full SAM2 + OpenPose masking (needs a modern Nvidia GPU)
docker compose -f docker-compose-local-gpu.yml pull
docker compose -f docker-compose-local-gpu.yml up -d postgres   # wait ~10s
docker compose -f docker-compose-local-gpu.yml up -d
```

- [ ] Open **<https://localhost>** and confirm the interface loads.

> If port 443 is taken you'll get a `driver failed programming external connectivity` error — stop
> whatever is using 443 and retry. Lighter CPU alternative: the older `original` branch of the main
> repo (`git clone -b original https://github.com/MaskAnyone/MaskAnyone.git`) also runs on CPU.

---

## Which do I need?

| You have… | Track 1 (notebook) | Track 2 (MaskAnyone) |
|---|---|---|
| Laptop, no Docker | ✅ do this | **Option A** — hosted pilot |
| Laptop + Docker, no GPU | ✅ do this | **Option A**, or **B** with `docker-compose-local.yml` |
| Laptop + Docker + Nvidia GPU | ✅ do this | **B** with `docker-compose-local-gpu.yml` (full SAM2), or **A** |

**Minimum to be ready:** Track 1 done. **Ideal:** Track 1 + a working MaskAnyone (Option A or B).

---

## Requirements recap

- Laptop + modern browser (Chrome/Firefox); WiFi provided.
- Python **3.9–3.12** (not 3.13 — MediaPipe has no 3.13 wheels), conda *or* venv.
- Docker **only** if you self-host MaskAnyone (Track 2 · Option B).
- **No GPU required** for the notebooks, the hosted pilot, or the CPU (`docker-compose-local.yml`)
  build. A GPU only unlocks the full SAM2 + OpenPose masking in the `-gpu` build.
