# A Web-Based Library Book Reservation, Borrowing, and Inventory Management System with QR-Based Scanning for STI College Alabang

A Capstone Project Proposal
Presented to the Faculty of the
Information and Communications Technology Program
STI College Alabang

In Partial Fulfilment of the Requirements for the Degree
**Bachelor of Science in Information Technology**

**Proponents:**
- Dadea, Jerico B.
- Floriano, Kayle Andrew P.
- Neri, Godwyn O.
- Resurreccion, Rhed R.
- Tolentino, Keneth James B.

**Date of Proposal Defense:** `<Date of Proposal Defense>`
**School:** STI College `<School Name>`

---

## Endorsement Form for Proposal Defense

**Title of Research:** A Web-Based Library Book Reservation, Borrowing, and Inventory Management System with QR-Based Scanning for STI College Alabang

**Name of Proponents:**
- Jerico B. Dadea
- Kayle Andrew P. Floriano
- Godwyn O. Neri
- Rhed R. Resurreccion
- Kenneth James B. Tolentino

In Partial Fulfilment of the Requirements for the degree Bachelor of Science in Information Technology has been examined and is recommended for Proposal Defense.

**Endorsed By:**

__________________________________
**John Renaund L. Baybay**
*Capstone Project Adviser*

**Approved For Proposal Defense:**

__________________________________
**Richard Rodney T. Ibarreta**
*Capstone Project Coordinator*

**Noted By:**

__________________________________
**Ricson M. Ricardo**
*Program Head*

**Date:** `<Date of Proposal Defense>`
**School:** STI College `<School Name>`

---

## Approval Sheet

This capstone project proposal titled **A Web-Based Library Book Reservation, Borrowing, and Inventory Management System with QR-Based Scanning for STI College Alabang**, prepared and submitted by Jerico B. Dadea, Kayle Andrew P. Floriano, Godwyn O. Neri, Rhed R. Resurreccion, and Kenneth James B. Tolentino in partial fulfillment of the requirements for the degree of Bachelor of Science in Information Technology, has been examined and is recommended for acceptance and approval.

__________________________________
**John Renaund L. Baybay**
*Capstone Project Adviser*

Accepted and approved by the Capstone Project Review Panel in partial fulfillment of the requirements for the degree of Bachelor of Science in Information Technology.

__________________________________
**`<Panelist's Given Name MI. Family Name>`**
*Panel Member*

__________________________________
**`<Panelist's Given Name MI. Family Name>`**
*Panel Member*

__________________________________
**`<Panelist's Given Name MI. Family Name>`**
*Lead Panelist*

**Noted:**

__________________________________
**Richard Rodney T. Ibarreta**
*Capstone Project Coordinator*

__________________________________
**Ricson M. Ricardo**
*Program Head*

**Date:** `<Date of Proposal Defense>`
**School:** STI College `<School Name>`

---

## Table of Contents

- [Introduction](#introduction)
  - [Project Context](#project-context)
  - [Purpose and Description](#purpose-and-description)
  - [Objectives of the Study](#objectives-of-the-study)
  - [Scope and Limitations](#scope-and-limitations)
- [Review of Related Literature/Studies/Systems](#review-of-related-literaturestudiessystems)
- [Methodology](#methodology)
  - [Technical Background](#technical-background)
  - [Requirements Analysis](#requirements-analysis)
  - [Requirements Documentation](#requirements-documentation)
  - [Design of Software, System, Product, and/or Processes](#design-of-software-system-product-andor-processes)
- [References](#references)
- [Appendices](#appendices)
  - [Appendix A. Resource Persons](#appendix-a-resource-persons)
  - [Appendix B. Personal Technical Vitae](#appendix-b-personal-technical-vitae)

---

## Introduction

### Project Context

The way we manage information is changing fast, but many school libraries still face big challenges with keeping track of their books. At STI College Alabang, the library needs to handle many different types of students and a wide variety of subjects every single day. Currently, manual ways of recording who borrows a book or checking if a book is still on the shelf can be very slow and can lead to mistakes. If the records are not updated correctly, students might have a hard time finding the materials they need for their studies.

This problem is not just happening in one school it is a common issue for many libraries that still rely on old methods. When there are too many books and many students borrowing them at the same time, it becomes difficult for librarians to stay organized. Based on what we see in schools today, there is a clear need for a system that can work even when the internet is slow or unavailable. Without a reliable digital tool, books can go missing, and the library’s inventory can become outdated very quickly.

This project focuses on creating a web-based system specifically designed to solve these issues for the STI College Alabang community. By using modern tools like QR codes and online syncing, the system aims to make borrowing and returning books much smoother for everyone. The reason for choosing this study is to help the school manage its resources better and make sure every student has fair access to books. Therefore, the goal of this research is directly connected to the need for a faster, more accurate, and more reliable library system.

### Purpose and Description

The main purpose of this project is to provide STI College Alabang with a simple and helpful digital tool for managing its library. Its primary function is to help the librarian keep track of every book, manage student borrowings, and allow students to reserve books online before they even get to the library. Instead of writing everything down by hand, the system lets staff use QR codes to quickly scan books in and out, which saves a lot of time and prevents errors.

What makes this project special is that it is built to be very reliable and easy to use. One of its best features is that it can work even if the school’s internet connection goes down. The system will save all the information locally and then automatically update everything to the cloud once the internet is back. This ensures that the library's records are always safe and that the staff can keep working without any interruptions.

The innovation in this system is how it brings all library tasks into one easy-to-reach website. It is designed to be very user-friendly, so students can check if a book is available using their phones or computers. By making the library more organized and digital, this project helps the school take better care of its books and provides a much better experience for students and teachers alike.

### Objectives of the Study

#### General Objectives
To design and develop a web-based library book reservation, borrowing, and inventory management system with QR-based scanning for STI College Alabang that enhances efficiency in library transactions, improves inventory tracking accuracy, and provides convenient access to library services for students and librarians.

#### Specific Objectives

- **To develop a secure web-based platform that allows students to search, reserve, and borrow library books online.**
  This objective aims to create an accessible online system where students can conveniently browse the library catalog, check book availability, place reservations, and request borrowing without physically visiting the library. This improves accessibility and reduces congestion in manual transactions.

- **To implement a QR code–based scanning feature for faster and more accurate book check-in and check-out processes.**
  This feature will utilize QR codes attached to each book to automate the borrowing and returning process. By scanning the QR code, the system can instantly record transactions, minimize human error, speed circulation, and ensure accurate tracking of borrowed and returned books.

- **To create an automated inventory management module that tracks book availability, quantity, and status in real time.**
  This module will continuously update the database whenever books are borrowed, returned, reserved, or marked unavailable. It enables librarians to monitor stock levels, detect missing items, and maintain an up-to-date record of all library resources.

- **To design a user-friendly interface for students and librarians to easily manage reservations, borrowing records, and returns.**
  The system will feature an intuitive and easy-to-navigate interface that accommodates both students and library staff. This ensures that users can efficiently perform tasks such as reserving books, viewing borrowing history, and processing returns with minimal training.

- **To integrate a notification system that informs users about reservation confirmations, due dates, and overdue books.**
  This objective focuses on implementing automated alerts through email or in-system notifications. These reminders help students stay informed about their transactions and encourage timely returns, thereby reducing overdue cases and improving circulation management.

- **To generate reports and analytics for librarians to monitor book circulation, popular titles, and inventory status.**
  The system will produce summarized and detailed reports that provide insights into borrowing trends, frequently borrowed books, and overall inventory conditions. These analytics support informed decision-making for book acquisition and collection management.

- **To ensure data security and integrity through user authentication and role-based access control (admin and student).**
  This objective emphasizes protecting sensitive data by requiring secure login credentials and assigning specific access levels. Students will have limited functions (search, reserve, borrow), while administrators can manage inventory and records, ensuring proper control and accountability.

- **To reduce manual errors and improve overall library transaction efficiency through system automation.**
  By automating core processes such as catalog searching, borrowing, returning, and inventory tracking, the system minimizes repetitive manual tasks. This reduces the likelihood of record inconsistencies, speeds up operations, and enhances overall service efficiency in the library.

### Scope and Limitations

*This part should include a brief statement of the general purpose of the study, the target users/beneficiaries of the study, the period of the study, and the features of the proposed software.*

*The limitation of the study includes the weaknesses of the study beyond the control of the researcher.*

> **TODO:** Delete this highlighted section and replace it with the specific scope and limitations of your study.

---

## Review of Related Literature/Studies/Systems

A literature review aims to show the reader what the researchers have read and that they have a good grasp of the main published work concerning a particular topic or question in a particular field. This work may be in any format, including online sources.

It is very important to note that the review should not be simply a description of what others have published in the form of a set of summaries but should take the form of a critical discussion, showing insight and an awareness of differing arguments, theories, and approaches. It should be a synthesis Project and analysis of the relevant published work, linked at all times to your own purpose and rationale.

Literature reviews should comprise the following elements:
- An overview of the subject, issue, or theory under consideration, along with the objectives of the literature review;
- Division of works under review into categories (e.g., those in support of a particular position, those against, and those offering alternative theses entirely);
- Explanation of how each work is similar to and how it varies from the others; and
- Conclusions as to which pieces are best considered in their argument are most convincing of their opinions and make the greatest contribution to the understanding and development of their area of research.

Published as well as unpublished research studies are sources of materials that may be included in this section. The research studies may also be identified as foreign or local. Existing systems that are closely related to the research/design are considered in this section and may be identified as foreign or local.

**Common Guidelines in Citing Related Literature and Studies:**
- The materials must be as recent as possible.
- The materials must be as objective and unbiased as possible.
- The materials must be relevant to the study.
- The materials must not be too few or too many.

After reading, the readers should gain an adequate understanding of the technical topic(s) involved in the capstone project.

> **TODO:** Delete this highlighted section and replace it with your own review of related systems.

The last section contains the conclusive summary of the Review of related literature/systems. In case the proposed project is a continuation of previous work, this section should give emphasis or justification for why the proposed project is needed.

In the succeeding paragraphs, there should be no indentations, paragraphs are justified with left alignment. 

> **TODO:** Delete this highlighted section and replace it with your own synthesis.

---

## Methodology

### Technical Background

**Technologies to be Used**
This contains discussions on the current trends and technologies to be used in developing and implementing the proposed system.

**Calendar of Activities**
This should contain the detailed sequence of activities that the proponents will undergo in completing the project. This should discuss the activities, purpose, or objectives of each activity, the persons involved, and the resources needed in chronological order of execution.

**Resources**
This should list the specific hardware and software resources that the proponents expect to need in completing the project.

### Requirements Analysis
On this part, the proposed system or software must provide computing solutions to address the needs of a customer/client in terms of the following: 
- **Who** – the people involved, 
- **What** – the business activity, 
- **Where** – the environment in which the work takes, 
- **When** – the timing, 
- **How** – how the current procedures are performed.

### Requirements Documentation
This part establishes the basis for the agreement between the customer/client and the developers/programmers on what the software product is to do. Under this, all software features are enumerated in detail by providing a storyboard showing how the software would look if the same was already designed and coded.

### Design of Software, System, Product, and/or Processes
In this part, the proponents shall describe in detail how they will design the proposed system in accordance with standards.

---

## References

The reference list provides the information necessary for a reader to locate and retrieve any sources cited in the body of the paper. Each source you cite in the paper must appear in your reference list; likewise, each entry in the reference list must be cited in your text. Your references should begin on a new page separate from the text of the manuscript; label this page **REFERENCES** centered at the top of the page (bold, but do not underline or use quotation marks). All text should be double-spaced, just like the rest of the text.

### Basic Rules
- All lines after the first line of each entry in your reference list should be indented one-half inch from the left margin. This is called hanging indentation.
- Authors' names are inverted (last name first); give the last name and initials for all authors of a particular work unless the work has more than six authors. If the work has more than six authors, list the first six authors and then use et al. after the sixth author's name to indicate the rest of the authors.
- Reference list entries should be alphabetized by the last name of the first author of each work.
- If you have more than one article by the same author, single-author references or multiple-author references with the exact same authors in the exact same order are listed in order by the year of publication, starting with the earliest.
- When referring to any work that is NOT a journal, such as a book, article, or Web page, capitalize only the first letter of the first word of a title and subtitle, the first word after a colon or a dash in the title, and proper nouns. Do not capitalize the first letter of the second word in a hyphenated compound word.
- Capitalize all major words in journal titles.
- Italicize titles of longer works such as books and journals.
- Do not italicize, underline, or put quotes around the titles of shorter works such as journal articles or essays in edited collections.

*(Note: The full reference guidelines from your original text have been condensed for brevity. Please refer to APA guidelines for detailed citation examples.)*

---

## Appendices

### Appendix A. Resource Persons
*(To be populated)*

---

### Appendix B. Personal Technical Vitae

#### Curriculum Vitae of `<GIVEN NAME MI. FAMILY NAME>`

`<complete address>`
`<email address>`
`<contact number either cellular phone or landline or both>`

**Educational Background**
- **Tertiary:** `[month year]` `[Name of school/ Institution]`
- **Vocational/Technical:** `[month year]` `[Name of school/ Institution]`
- **High School:** `[month year]` `[Name of school/ Institution]`
- **Elementary:** `[month year]` `[Name of school/ Institution]`

**Professional or Volunteer Experience**
*(Listed in reverse chronological order - most recent first)*
- `[month year]` - `[Nature of Experience/Job Title]` - `[Name and Address of Company or Organization]`

**Affiliations**
*(Listed in reverse chronological order - most recent first)*
- `[month year]` - `[Name of Organization]` - `[Position]`

**Skills**
- `[SKILL]` - `[Level of Competency]` - `[Date Acquired (month year)]`

**Trainings, Seminars, or Workshops Attended**
*(Listed in reverse chronological order - most recent first)*
- `[month year]` - `[Title of Training, Seminar, or Workshop]`