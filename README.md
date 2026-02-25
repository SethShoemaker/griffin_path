# classmap

Classmap is a generalized software solution for displaying course information, degree progress, and section enrollment eligability to students. The goal is to provide a one-stop-shop solutions for a student's academic advising needs. It works by collecting course section information, student degree information and combining the two into a dashboard which allows students to search through course offerings, figure out what classes they are eligible for and not eligible for, and get a high level overview of their progress towards getting their degree.

The system, as its currently envisioned, is entirely customizable. It is not SHU specific, so it can be ported to any high ed institute. This is subject to change based on time constraints. It's faster to write a SHU specific mini application that it is to create a generalized higher ed advising system.

Assuming the all of the configuration features are implemented, a higher ed institution will be able to configure a course section search based on their own needs, upload course sections, configure a student record, upload students, and upload / enter section enrollment criteria to communicate to students what exactly they need to achieve in order to be eligable for a given section.

## Student flow
The following is a super basic flow chart describing how a student will use the system. It's not much, from the students' point of view, this is a small application.
```mermaid
flowchart TD

    A[Student Opens Dashboard] --> B[Login]
    B --> C{Login Successful?}

    C -->|No| B1[Show Error Message]
    B1 --> B

    C -->|Yes| G[Course Dashboard]

    G -->|Change Query| E[Search/Filter Courses]
    E -->|Show Query Results| G[View Course Results]
```


## Data Pipeline
The following is a rough depiction of how data will enter this system. Essentially this is a one way load, with the occassional manual cleaning of data (some data comes in unstructured, so it is structured in classmap)
```mermaid
flowchart TD

    A[Data originates in SIS] --> B[Automation queries SIS data to upload to classmap]
    B --> C[classmap receives SIS data]

    C --> D[classmap validates data]

    D --> E[classmap stores data]

    E -->|Manual cleaning of data if necessary| E

    E --> F[student accesses website, looks at data]
```


## Database Diagram / Data Storage (WIP)
```mermaid
erDiagram
    section {
        string id PK
    }

    section_field {
        int id PK
        string name UK
        string type
        bool unique
        bool required
        bool public
    }

    section ||--|{ section_field_value : "a section field value references the section which has a field value"
    section_field ||--|{ section_field_value : "a section field value references the field which is being filled"
    section_field_value {
        string section_id PK,FK
        int field_id PK,FK
        string value
    }

    section_field ||--|{ section_field_usage : "a section field usage references the field that is being used"
    section_field_usage {
        int id PK
        int field_id FK
        bool public
        string description
    }

    section_search_filter {
        int id PK
        string name UK
        string slug UK
        int position UK
        string type
    }

    section_field_usage ||--o| section_search_filter_section_field_usage : "the link between a section search filter and its field usages"
    section_search_filter ||--|{ section_search_filter_section_field_usage : "the link between a section search filter and its field usages"
    section_search_filter_section_field_usage {
        int filter_id PK,FK
        int field_usage_id PK,FK
    }

    section_search_filter ||--o| section_search_text_search_filter : "if a filter is a text search filter, it will have a text search filter row"
    section_field ||--o| section_search_text_search_filter : "the link between a text search filter and the field"
    section_search_text_search_filter {
        int filter_id PK,FK
        int field_id FK
    }

    section_search_filter ||--o| section_search_multi_select_or_filter : "if a filter is a multi select or, it will have a text search filter row"
    section_field ||--o| section_search_multi_select_or_filter : "the link between a multi select or filter and the field"
    section_search_multi_select_or_filter {
        int filter_id PK,FK
        int field_id FK
    }

    section_search_column {
        int id PK
        string name UK
        int position UK
        string type
    }

    section_field_usage ||--o| section_search_column_section_field_usage : "the link between a section search column and its field usages"
    section_search_column ||--|{ section_search_column_section_field_usage : "the link between a section search column and its field usages"
    section_search_column_section_field_usage {
        int column_id PK,FK
        int field_usage_id PK,FK
    }

    section_search_column ||--o| section_search_basic_column : "if a column is a basic column, it will have a basic column row"
    section_field ||--o| section_search_basic_column : "the link between a basic search column and the field"
    section_search_basic_column {
        int column_id PK,FK
        int field_id FK
    }
```

## Plan B

If this somehow doesn't work, I can always pivot to a version of this application which only uses public data. This is highly unlikely though.

## Milestones

### Phase 1 (Basic course search) (Done within 2-3 weeks)
For the next two weeks, I will have:
* Create code / database structure for configuring section data storage (what fields exist on a section, how do they behave)
* Load / enter section data storage configuration
* Load class sections into database
* Create code / database structure for configurable filtering/searching page for sections
* Load/enter section filtering/searching page configuration
* Create UI for section search page
* initial deployment of system!!!

### Phase 2 (student login and basic data)
* Create code / database structure for configuring student data (what fields exist on a student)
* Load / enter student data storage configuration
* Load / enter student data
* Setup SSO/login so students can login to system and be matched against a student record in the system
* Create UI for viewing student data
* Deploy newer version!!!

### Phase 3 (student course data)
* Create code / database structure for configuring student course data storage (what fields exist on a student-course relationship)
* Load / enter student course data storage configuration
* Load / enter student course data
* Create UI for viewing student course data
* Deploy newer version!!!

### Phase 4 (student degree progress)
* Create code / database structure for storing student degree progress
* Load student degree progress
* Create UI for viewing student degree progress
* Deploy new version!!!

### Phase 5 (section enrollment criteria)
* Create code / database structure for storing section enrollment criteria
* Load / enter section enrollment criteria
* Create UI for showing courses which are eligable for or not eligable for
* Deploy new version!!!