# Collaborative Editing

A small amount of investigation into allowing collaborative editing took place early in the project.

[Operational Transformation](https://en.wikipedia.org/wiki/Operational_transformation) (OT) is commonly used for this kind of behaviour.

Google have a [diff-match-patch](https://github.com/google/diff-match-patch) library that can be used to compare two pieces of text and create a new output combining changes between the two.
I initially made a very quick attempt at a collaborative mode by using this library and some web socket behaviour to push changes between two editor instances.
This worked OK but did hit an issue with cascading updates, where updating one editor would update the second, but that would trigger an update back to the first so the process would bounce back and forth continually.
This method also requires sending the whole text every time it changes, whereas OT only sends the changes and their position so would require much less bandwidth.

The CodeMirror 6 library we are using for the editor panels does have some support for [collaborative editing](https://codemirror.net/6/examples/collab/) but this has not been looked into in any depth.

An alternative to OT is [Conflict-free-replicated data type](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type), from this [Slack thread](https://raspberrypifoundation.slack.com/archives/C02D2T8JMQU/p1634318188000700).


## Read-Only

It was thought that a likely first step for this would be allowing "read-only viewing" of a project by someone. The collaborator would be able to see real-time code changes but not be able to edit any documents.

## Not in scope

Any communication between collaborators outside of code editing was felt to be out of scope for this project.
I.e. we would not be looking at implementing a chat feature, or audio/video connection.

## Outcome

No decision about how to proceed with collaborative editing was made as it was determined it was not going to be needed for some time.
Beyond a very high level look at potential technologies no real investigation or assessment of implementations was made.
