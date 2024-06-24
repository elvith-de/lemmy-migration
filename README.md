# lemmy-migration
Site to migrate settings, etc. from feddit.de to feddit.org

Currently in development. Try it here: https://elvith-de.github.io/feddit-migration

Static site, runs locally in browser. Connects to (defect) feddit.de, exports user settings and imports them to feddit.org.

Basic features:
* Login and export settings from feddit.de (or any other instance)
* Optionally save exported data to a local file
* Login and import settings to feddit.org (or any other instance)

Planned future settings:
* optionally analyze joined communities and cross reference to local communities on target instance and offer to add those while the migration
