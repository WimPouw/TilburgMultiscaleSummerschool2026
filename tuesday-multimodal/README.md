# Tuesday: Multimodal Data Analysis

## Overview

This tutorial provides a detailed example of how to go from raw files from an
existing corpus (including cleaning and operationalization) to testing a set of
specific hypotheses (using permutation tests).

**Remember: This is a breadcrumb trail for you to follow; you aren't expected
to be ready to do all of this yet.** You *can* do this. Be *patient* with yourself
as you continue to learn!

## Running Dataset

For this tutorial, we'll be using a subset of the 
[Santa Barbara Corpus of Spoken American English](https://www.linguistics.ucsb.edu/research/santa-barbara-corpus-spoken-american-english) 
(CC-BY-ND 3.0, John W. Du Bois). I've chosen a series of dyadic conversations
for our tutorials; all of those should already be downloaded and available if
you've cloned the Summer School repository:

* `TilburgMultiscaleSummerschool2026/Datasets/SantaBarbaraCorpus`
  * `./metadata/`: Directory of participant metadata.
    * `./TRN/`: Directory of transcripts, with filenames to match `.wav` files.
    * `./WAV/`: Directory of audio files, with filenames to match `.trn` files.

The entire corpus is a great resource for a variety of different kinds of
conversations, including with larger groups than just dyads. I encourage you
to look around more if you're interested in context effects of interaction.

## Requirements

To complete this tutorial, you will need no more than the general requirements
for the workshop. Please see the `README` in the top level of this repository.

## Tools

To run this tutorial, you will need the following R packages installed:

* `tidyverse`
* `ConversationAlign`
* `word2vec`
* `knitr`
* `lsa`

## Key References

A few useful papers have been uploaded to the `readings/` subdirectory of this
tutorial directory. These papers were either referenced in my talk or are
useful for understanding this dataset.

* Du Bois et al. (1993): Describes the coding scheme used for the Santa Barbara
Corpus of Spoken American English.
* Louwerse et al. (2012): Example of multiple unimodal analyses of the same dataset
(including eye-tracking, language, and more).
* Paxton et al. (2024): Prior multi-level analysis of language coordination. Uses the
dataset presented in Romero & Paxton (2023).
* Romero & Paxton (2023): Prior analysis of movement coordination. Uses the same
dataset later analyzed in Paxton et al. (2024).
* Wallot et al. (2016): Example of multiple multi-level analyses of the same dataset
(heart rate and multiple hand accelerometers).

## Connection to Other Days

* Builds on Monday's introduction to multimodal and multiscale concepts.
* Connects to Wednesday's discussions of quantifying multimodal and multiscale
coordination.
* Provides an introduction to ideas of permutation tests that are similar to
surrogate analyses on Wednesday.