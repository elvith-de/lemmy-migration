# lemmy-migration
Site to migrate user settings like followed communities, biography, 

Try it here: https://elvith-de.github.io/lemmy-migration

Static site, runs locally in browser. Connects to any Lemmy instance whose API is rechable (e.g. the defect feddit.de instance), exports user settings and imports them to another Lemmy instance (e.g. feddit.org).

Features:
* Login and export settings from any Lemmy instance (e.g. feddit.de)
  * Migration includes features like
    * Biography
    * Avatar
    * Saved Posts & Comments
    * Followed Communities
    * Blocked Communities
    * Blocked Users
    * Blocked Instances
* Optionally: Find local communities on the target instance that match followed communities
* Optionally: Backup you settings to a file (can be imported on any Lemmy instance in your profile)
* Login and import settings to any Lemmy instance (e.g. feddit.org)

# Used 3rd Party components
## jquery

Source repository: https://github.com/jquery/jquery

By OpenJS Foundation and other contributors, https://openjsf.org/

Licensed under MIT License [(see attached LICENSE)](./docs/jquery/LICENSE)

## Material Design Lite

Source repository: https://github.com/google/material-design-lite

By Google

Licensed under Apache-2.0 license  [(see attached LICENSE)](./material-design-lite/LICENSE)
