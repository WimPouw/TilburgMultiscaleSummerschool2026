# MDIG2026 Summer School Tilburg

This repository stores all materials for **MDIG2026 Summer School Tilburg** which takes place between **13-17 July 2026** at Tilburg university.

To make sure we all start on the same page, please prepare your laptop by following the instructions below. 

## Get ready

### Installing Python

To be able to follow the summer school and explore the coding procedures, you will need to have a Python available. 

The easiest way to get Python is installing [Anaconda](https://www.anaconda.com/download), a common platform for this programming language.

> [!IMPORTANT] 
> At some point during the installation process, you need to check :ballot_box_with_check: that you want **to add Anaconda/Python to system path**. Without that, your command prompt or the text editor will not know where to find executor. 

If you feel you need a guidance, you can follow one of many tutorials online (e.g., [here for Mac]( https://www.youtube.com/watch?v=YJC6ldI3hWk), and [here for Windows](https://www.youtube.com/watch?v=UTqOXwAi1pE)). 

### Get yourself a text editor

To work with Python scripts, it is very convenient to have a text editor. Essentially, this can be any software that can edit texts. 

[Visual Studio Code](https://code.visualstudio.com/) for instance offers very nice GUI. Once you have installed it, you need to do few more adjustments so that VS Code can recognize a Python script. Go to Extension panel (*Ctrl + Shift + X*) and search for Python. Click on the install button. Do the same with extension Jupyter.

### Installing R and RStudio

To be able to follow along, you will need to have R and RStudio available.

You will need to install **two things**: first the R language itself, then RStudio (a user-friendly interface for working with R).

1. Install **R** from [https://cran.r-project.org](https://cran.r-project.org) — choose the version for your operating system (Windows, Mac, or Linux).
2. Install **RStudio Desktop** (the free version) from [https://posit.co/download/rstudio-desktop](https://posit.co/download/rstudio-desktop).

> [!IMPORTANT]
> Always install R **before** RStudio. RStudio is just an interface — it needs R to be present on your system in order to work.

If you feel you need guidance, you can follow one of many tutorials online (e.g., [here for Mac](https://www.youtube.com/watch?v=n8kP7c_QbLA), and [here for Windows](https://www.youtube.com/watch?v=YrEe2TLr3MI)).


### Clone/download the repository

Once you are all set up, it's time to get this repository to your PC.

> [!IMPORTANT]
> Note that you will need circa 60 GB of free space on your computer. Make sure you have this space before the summerschool starts!

Here, you can either use [Github Desktop](https://desktop.github.com/download/) which will later also allow you to synchronize your local version of this repository with any updates we may do here.

**How to clone repository via Github?** After installing, launching Github Desktop, and signing in with your Github credentials, simply click on *File > Clone repository... > URL* and paste there the link to this repository, https://github.com/WimPouw/TilburgMultiscaleSummerschool2026

If you don't want to install yet another software, you can just download the repository. At the top of this page, click on **<> Code** and then **Download ZIP**. This will download the repository.


## Troubleshooting

### Github pull error: Filename too long
If you are a Windows user, you might encounter an error message 'Filename too long'. To overcome this go to your Windows PowerShell (with left click open as Administrator) and type

```bash
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force

git config --global core.longpaths true
```

Restart your machine and clone again.

### Did we not address your problem?

If you have encountered a problem that is not listed here, please let us know - ideally **before** the summer school. We will do our best to help you out. You can reach us via email *kadava[at]leibniz-zas[dot]de*
