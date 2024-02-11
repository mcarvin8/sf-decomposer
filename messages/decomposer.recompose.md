# summary

Recomposes the files created by the 'decompose' command into the original directories with the original file-names.

# description

This command will read all of the decomposed XML files by sub-directories and add them to the same file.

You should use this before deploying metadata to the target org.

# examples

- `sf decomposer recompose -m "flow"`

# flags.dx-directory.summary

Directory containing Salesforce metadata (default: `force-app/main/default`).

# flags.metadata-type.summary

Type of metadata to process.
