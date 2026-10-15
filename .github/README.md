# GitHub

`workflows/checks.yml` runs the application's automated checks on pushes and pull requests. GitHub requires workflow files under `.github/workflows`; a plain `github/` folder would not run them.

Repository source and this configuration can be committed. `.git/` is Git's internal history and must not be moved here or deleted.
