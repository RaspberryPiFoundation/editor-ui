# Stop Button

Clicking stop button dispatches the `stopCodeRun` action to the Redux store to interrupt the code run. This is achieved by throwing an error at the next suspension in the code. 

## Frequency of Suspensions

The `debugging = true` setting in the `Sk.configure` block places a suspension at the start of each line, enabling the code to be interrupted at any point. The performance implications of suspending the code at such a high frequency are currently unknown. An alternative approach would be to set `killableWhile = true` and `killableFor = true` instead of the `debugging` option. However, this would have the disadvantage of only allowing the code to be interrupted at a limited number of points, such as at the start of each iteration of a `for` or `while` loop or before a call to `time.sleep`. The latter approach appears to be that being used by Trinket.

## Known Limitations

One known limitation of the current appraoch is the inability to interrupt python `sleep`. Consequently, the program execution is only terminated once the `sleep` time has elapsed. Trinket currently has the same limitation. As an initial pass, the stop button turns grey once clicked with the text 'Stopping...', informing users that their instruction to stop the code has been registered. A future iteration could have a `?` tooltip when the button is in the 'Stopping...' state that informs users of this limitation. 

If this limitation proves problematic for users, an alternative approach could be to override the built-in python `sleep` functionality with a series of shorter `sleep`s, allowing for interruption every half a second or so.
