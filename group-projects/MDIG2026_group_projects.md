# MDIG2026 Summer School Tilburg
## Multiscale Social Dynamics in Individuals and Groups
### Group Projects Overview

Each group will conduct a mini research project applying one or more multiscale analysis pipelines to real social dynamics data (e.g., interpersonal coordination, group interaction, or collective behavior). Groups will work with a curated subset of a larger dataset. The main goal is to apply analyses covered during the summer school to this subset in a way that is principled enough to scale up to the full dataset.

The core outcomes are:
- Preliminary exploratory analyses of the data and how groups interpret those findings
- The key components of a **pre-registration**: a document that specifies in advance (before running confirmatory analyses on the full data) the research question, hypotheses, chosen methods, and analysis plan

Pre-registration is a cornerstone of open science that helps distinguish hypothesis-generating exploration from hypothesis-testing confirmation, and makes it easier for others to evaluate and build on your work. Thus, the goal is not to conduct a full empirical study, but to go through the arc of empirical work and to do so in a way that someone else could understand, evaluate, and build on it.

Projects should be conducted under the spirit of open science: analysis code should be written to be readable and shareable, decisions should be documented as they are made, and outputs should be organized so that the work is reproducible by someone outside the group. Given the time constraints, perfection is not the goal, but cultivating the habit of working openly is.

Groups are encouraged to use subsets of the datasets provided by the summer school (recommended, as these are pre-cleaned, documented, and method-ready). Everyone is, however, welcome to bring their own data, provided that (1) it is suitable for multimodal multiscale analysis, and (2) it can be shared openly within the group. You can check with us beforehand if your data is suitable. Data involving human participants should have appropriate consent for secondary use in an educational context. Even when data can be shared fully, consider protecting identities of individuals by reducing identifiable information through the masking techniques you have learned to use during the summer school.

The project culminates in a **10-minute presentation** followed by **5 minutes of questions**, delivered on the final afternoon to the full summer school cohort. Groups are also asked to deposit their project materials including code, a brief readme, and any shareable data in a public repository (e.g., OSF, GitHub, or Zenodo) by the end of Day 5.

---

## Group Size & Skill Complementarity

Groups of approximately 5 participants work best for this format -- large enough to divide tasks and bring diverse perspectives, small enough to stay agile and ensure everyone contributes meaningfully.

We will aim to form groups in advance aiming for complementarity across at least three dimensions:

- **Technical skills:** ideally each group has someone comfortable with data wrangling/scripting (Python or R), someone familiar with signal processing or time-series analysis methods, and someone with experience in visualization or statistics. Participants with qualitative expertise are also very welcome and can contribute through interpretive framing, thick description of phenomena, and connecting findings to theory. Not every group will have all of these, and that is fine. Part of the learning is figuring out how to work with the skills you have.

- **Disciplinary background:** the most productive groups typically mix people who think about the phenomenon (e.g., psychologists, linguists, social scientists, anthropologists) with people who think about the method (e.g., computer scientists, physicists, data scientists).

- **Role orientation:** within the group, it helps to loosely assign roles early: someone to lead coordination and keep track of the day's milestone, someone to own the analysis pipeline, someone to own the narrative and presentation, and someone to serve as the group's reproducibility lead, responsible for keeping the shared repository organized, writing brief notes on decisions made, and making sure the code runs on someone else's machine. These roles can rotate or overlap, but making them explicit prevents the common failure mode of five people all doing the same thing.

---

## Learning Objectives

By the end of the project, participants should be able to:

1. Formulate a focused research question grounded in multiscale social dynamics, scoped realistically for a short project.
2. Select and apply at least one analysis pipeline from the summer school (e.g., time-series analysis, recurrence quantification, network analysis, or similar complexity science tools) to multimodal data.
3. Interpret multiscale patterns - linking micro-level (e.g., individual movement, gaze, speech) to meso/macro-level (e.g., group coordination, role emergence) observations, or patterns across varying resolutions.
4. Critically evaluate their own pipeline choices, including limitations, assumptions, and what the method does and does not reveal.
5. Apply open science practices - organize and document code and data so that the project is transparent and reproducible by someone outside the group.
6. Communicate findings accessibly to an interdisciplinary audience in a structured, time-bounded presentation.
7. Respond to questions and defend methodological and analytic decisions.
8. Draft the core components of a pre-registration: a research question, hypotheses, planned method, and analysis plan that could be submitted before running confirmatory analyses on the full dataset.

---

## Daily Milestones

### Day 1 - Orient & Scope (~2 hrs)

- Introductions within the group; identify complementary skills and assign initial roles, including a reproducibility lead
- Agree on a dataset (provided or self-brought) and a broad phenomenon of interest
- Set up a shared project repository (Codeberg, OSF, GitHub, or equivalent) -- even an empty one with a readme stub counts
- Draft an initial research question

**Deliverable:** A one-paragraph project pitch shared with instructors, and a live shared repository that all group members can access and contribute to.

### Day 2 - Explore & Decide (~2 hrs)

- Conduct exploratory data inspection (visualizations, basic descriptives)
- Narrow the research question based on what the data can actually support
- Identify candidate analysis methods from the summer school's agenda that are appropriate for your question and data
- Write a brief entry in a shared decision log -- a simple running document noting what you considered and why you chose what you did; this is the core of reproducible reasoning

**Deliverable:** A simple analysis plan (question → data → method → expected output) committed to the repository, plus the first decision log entry.

### Day 3 - Analyze (~2 hrs)

- Run the core analysis pipeline; troubleshoot together
- Write code with comments -- aim for someone outside the group being able to follow the logic without asking you
- Produce at least one interpretable result (a plot, a metric, a pattern)
- Begin discussing what the result means in terms of multiscale dynamics

**Deliverable:** Analysis code pushed to the repository with at least basic inline documentation, and at least one figure with a written interpretation sentence.

### Day 4 - Interpret & Reflect (~2 hrs)

- Deepen interpretation; connect findings back to the theoretical framing from lectures
- Apply any relevant masking or anonymization to your data outputs and visualizations, using the techniques covered in the summer school
- Identify 1--2 limitations or alternative explanations, and note these in the decision log
- Check that someone else in the group can run the code end-to-end from scratch -- fix anything that breaks
- Begin building the presentation structure (see suggestions below)

**Deliverable:** A clean, runnable repository with a populated readme (data source, dependencies, how to run); draft slide outline or story arc for the presentation; a working draft of the pre-registration components (research question, hypotheses, chosen methods, planned analysis).

### Day 5 - Present & Share (~2 hrs)

- Final polish of slides/visuals
- Do a final repository tidy: clear readme, organized folders, no dead code
- Rehearse within the group (aim for ~8 min to leave buffer)
- Deliver 10-min presentation + 5-min Q&A
- After presenting, make the repository public (or as open as consent allows)

**Deliverable:** Final presentation delivered; repository publicly accessible and linked to the summer school's shared resource page.

---

## The Presentation

The final presentation is 10 minutes long with 5 minutes for questions. It is addressed to the full summer school cohort, so presenters should avoid assuming shared technical vocabulary and instead lead with the phenomenon and the question (although some common knowledge developed in the summer school can be assumed).

**Suggested structure:**

- **Context & question (1-2 min):** What social dynamic did you look at, and why does it matter? What was your specific research question?
- **Data & method (2-3 min):** What data did you use, and where can others access it? Which pipeline(s) did you apply, and why were they appropriate for the question?
- **Results (3-4 min):** What did you find? Lead with your best figure. What does it show at different scales?
- **Interpretation & reflection (1-2 min):** What does this mean? What are the limitations? What would you do next with more time? Where is your code so others can build on it?
- **Toward pre-registration (1-2 min):** What is your research question for the full dataset? What are your hypotheses and planned methods? What would you need to confirm before running those analyses?

All group members should be visible contributors, either as speakers or as the person fielding specific questions. Slides or some other visual form (e.g., a Quarto notebook) are required. Groups are encouraged to include a short slide at the end detailing individual contributions (e.g., using the CRediT taxonomy), but no time in the presentation need be allocated to this.
