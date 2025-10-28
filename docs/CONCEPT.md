# 🕹️ Game Concept

Here I want to document the basic concept of the _Impossible Mission_ game, showing some screenshots from the original game. This is what my project has to recreate.

<p align="center">
  <img src="../assets/impossible-mission-title.png" width="480" height="300" alt="Impossible Mission title screen">
</p>

In the game, you take on the role of a secret agent ("Agent 4125") who is trying to stop a diabolical mastermind named Elvin Atombender (because of course _that_ would be his name!) from tampering with national security computers and causing a nuclear catastrophe.

Every game has a map. That map has a layout. The layout is made up of a series of rooms. Those rooms are distributed over a series of levels.

<p align="center">
  <img src="../assets/images/imp-mission-layout.png" width="384" height="240" alt="Impossible Mission layout view on Pocket Computer">
</p>

In the above image, you can see at the bottom in the green area the portion of the map that the player has explored. (That whole interface at the bottom is the agent's "Pocket Computer.") There are nine vertical columns where those rooms can be. There are six horizontal rows where those rooms can be. Each row is a level. There can be at most nine rooms per level. There can be at most six rooms per column. There are eight elevator shafts. Each elevator shaft has a distinct elevator.

<p align="center">
  <img src="../assets/images/imp-mission-elevators.png" width="1080" height="208" alt="Impossible Mission elevators.">
</p>

There are thirty-two rooms in a given game and those rooms are filled with furniture items, lift platforms, and robots.

<p align="center">
  <img src="../assets/images/imp-mission-room.png" width="384" height="240" alt="Impossible Mission room.">
</p>

Within a given game, there are thirty-six "puzzle" items, nine "snooze" items, and nine "lift reset" items. These are all placed into furniture items randomly. In fact, the game was programmed to generate your starting position, the rooms, robots and placement of the puzzle pieces at the beginning of each game, using about eight to ten set patterns.

Atombender has two types of robots that are programmed to systematically rip you apart, atom-by-atom. The first type of robot, which looks like a _Star Wars_ droid of some type, has varying levels of randomly assigned intelligence. Some of these are stationary. Some of them move in a pattern. Some charge at you if you get close to them. Some will move toward you regardless of where you are. These robots are confined to their platforms. If you're unlucky enough to touch one, you die. Instantly. Some robots randomly have weapons that shoot out some sort of lightning bolt which, again, will kill you instantly.

<p align="center">
  <img src="../assets/images/imp-mission-killed.png" width="384" height="240" alt="Agent getting zapped by a robot.">
</p>

The other type of robot, which appears in less than half a dozen rooms, is a large, floating, electrified ball (usually called an "orb") which either flies around in a pattern or stalks you around the room.

<p align="center">
  <img src="../assets/images/imp-mission-orb.png" width="384" height="240" alt="Orb style droid chasing the agent.">
</p>

In addition to being killed by robots, you can also die by falling down a lift shaft.

I've mentioned dying in the game but it's worth noting you have unlimited lives. However every time you die you lose ten minutes of game time. When you only have six hours total to beat the game, this is consequential.

Atombender's underground fortress is rather expansive. As the above images show, various pieces of furniture are strewn about the premises, and you will need search each and every one to find all thirty-six pieces of an elaborately designed puzzle. Everything from desks to bookcases, to recliners, to toilets must be searched.

<p align="center">
  <img src="../assets/images/img-mission-room-with-robots.png" width="384" height="240" alt="Example of common room with robots and furniture.">
</p>

Most items you search will contain nothing. Some will be very difficult to reach. A common nuisance was the combination of those things: a very hard to reach item that contained nothing!

<p align="center">
  <img src="../assets/images/imp-mission-searching.png" width="384" height="240" alt="Agent searching furniture.">
</p>

<p align="center">
  <img src="../assets/images/imp-mission-nothing-found.png" width="384" height="240" alt="Agent finds nothing after search.">
</p>

As mentioned, you are working against the clock. Luckily for you, there are a few things that can help you out. Sometimes when you search a piece of furniture, you will find one of those items I mentioned before: a Lift Reset or a Snooze. (The Lift Resets are also called "lift inits," short for "lift initializers.")

<p align="center">
  <img src="../assets/images/imp-mission-found-snooze.png" width="384" height="240" alt="Agent finds a snooze item.">
</p>

These can be used at any computer terminal, and there is at least one terminal in every room.

<p align="center">
  <img src="../assets/images/imp-mission-use-terminal.png" width="384" height="240" alt="Agent using a terminal.">
</p>

Lift resets are basically special passwords that allow you to reset the position of all striped lifting platforms in a room. This is useful if you use a lift to reach a higher level, and then fall through a hole and can't get back up. Of course, you can reset the lift anytime by dying, but dying takes ten minutes of your time away.

Snoozes are even more useful. They shut down all the robots in a room for a short time, allowing you to walk past them without dying. Flying orbs will still kill you if you touch them, but they won't move.

There are other ways to earn Lift Resets and Snoozes. There are two rooms in _Impossible Mission_ that contain ridiculously large, checkerboard computer screens. These are "code rooms." (The term "organ room" has been used to describe these rooms.)

<p align="center">
  <img src="../assets/images/imp-mission-code-room-001.png" width="384" height="240" alt="Agent enters a code room.">
</p>

The first time you access one, it will light up three squares, each with a different tone. Your job is to push the buttons from lowest pitch to highest pitch, and when you do it correctly, you'll win either a Lift Reset or a Snooze.

<p align="center">
  <img src="../assets/images/imp-mission-code-room-002.png" width="384" height="240" alt="Agent tries entering a code.">
</p>

Each time you access one of these computers, the number of notes you need to put in order increases by one.

These rooms are technically sub-puzzles within the game, because they involve musical tones that must be played back in the correct sequence. It's worth noting that the puzzle is optional. This side puzzle is _not_ strictly necessary to complete the game, but the codes they provide are extremely useful in reaching difficult-to-access areas to find the final password pieces.

As you've seen, to move around Elvin's complex, you will need to use the corridors and elevators, which are connected to the rooms. In the rooms you can access lift platforms to move to a level, so you can search any furnishings in the room. The elevator or corridor is the only place you can call headquarters for help and access that pocket computer that I mentioned earlier. You will need to do this at some stage, to try and solve the puzzle. This is where the puzzle pieces come in.

Once you've searched through all the furniture in the professor's lair, you will find yourself in possession of thirty-six puzzle pieces. You must now take these puzzle pieces, and put them together to form nine solid card-type objects.

<p align="center">
  <img src="../assets/images/imp-mission-puzzle-001.png" width="384" height="240" alt="Agent checking his puzzle pieces.">
</p>

The only thing you have working for you is that the patterns can't overlap. The game will let you combine pieces that don't belong together, so you could have three pieces together, only to realize that you don't have a fourth piece that looks like what you need, and have to start from scratch again. But, wait it gets better! The pieces aren't all in the right orientation either. You can flip the pieces horizontally and vertically too, so in reality, you have to pick four supplementary pieces out of a possible 144. I don't recall James Bond ever having to deal with this!

<p align="center">
  <img src="../assets/images/imp-mission-puzzle-002.png" width="384" height="240" alt="Agent orienting his puzzle pieces.">
</p>

This is key to winning the game! It's important to understand that there are nine parts to the puzzle, which each contain four jigsaw pieces. When you have obtained the thirty-six pieces, you can attempt to crack each part, by putting the jigsaw pieces together.

Once all parts are completed, you will end up with nine letters which spell a word, which is randomly selected from about eight different nine letter words. This is the password required to enter the blue rectangle door in one of the rooms to confront and defeat Elvin.

<p align="center">
  <img src="../assets/images/imp-mission-lair-door.png" width="384" height="240" alt="Agent finds the lair door for Elvin.">
</p>

So, the basic gameplay loop is to successfully manage to avoid being killed by robots,collect all thirty-six puzzles pieces, then solve all nine puzzles, and do all that before time runs out in six hours, at which point Elvin unleashes nuclear armageddon. If you do this, you will be in possession of the nine letter password to Professor Atombender's control room.

<p align="center">
  <img src="../assets/images/imp-mission-atombender.png" width="384" height="240" alt="Agent confronts Atombender.">
</p>

## Puzzle Logistics

I do want to focus a bit on the puzzle logistics because it's crucial to implement this correctly if you want someone to be able to win the game. Here are all of the puzzle pieces in _Impossible Mission_ but, crucially, this is in only one possible correct orientation and order.

<p align="center">
  <img src="../assets/images/puzzle-image-01.png" width="453" height="395" alt="Possible puzzle pieces.">
</p>

Here is an example of one possible combination of solving the nine punch card puzzle.

<p align="center">
  <img src="../assets/images/puzzle-image-02.png" width="458" height="218" alt="Example combinatino for punch card puzzle.">
</p>

Every time you play a new game, the pieces of the puzzle are somewhat randomly generated. The password is different from game to game, as well. The password is always nine letters long. At the start of the game each of the nine punch cards is split into four pieces using a recursive method.

What seems to happen is that each piece is split into two pieces and then each of those pieces are then split into two thereby dividing each card into four pieces. The splitting process uses a number of "cookie cutter" overlays. The cutters resemble the nine shapes in the second picture above except they have no punch holes in them.

So, again, how this works is that a given punch card is cut into two using one of the nine overlays and then each of those two pieces is further divided into two using another of the remaining eight overlays. This has the interesting effect of ensuring there is a large number of permutations of different possible shapes to collect, each of which is generated uniquely at the start of the game. It also means from game to game you should not expect all the thirty-six different puzzle pieces to look the same as they did on the previous game. The example in the first picture is only one of the many different collections of pieces you might find.

This seems to be why the password contains nine letters. The game iterates through each of the nine cutters first and after that it electively chooses one of the other eight at random and uses it as the second cutter. This means it always uses three bits of the randomly generated number to choose the second cutter. This would imply that there are 134,217,728 different possible puzzles.

Again, it's important to note that the solution that the above picture shows is the solution from _one game_. Play it again and the pieces will be different.

## Tone Puzzle

I also want to focus on this particular bit since the implementation is important. Each game has two code ("organ", "chessboard") rooms where you can get passcodes by playing back the notes from low to high. But how long can that sequence possibly get?

As it turns out, the sequence maxes out at 14. The notes are also color-coded. It uses seven different colors to represent the notes and each color is used twice, once for the lower set of notes and once for the higher set. These are the mapped out colors:

<p align="center">
  <img src="../assets/images/imp-mission-code-sequence.png" width="493" height="233" alt="Example of tone sequences.">
</p>

However, they don't always go in sequence! Sometimes the sequence will include some notes from both the first and second sets, even if there are only three notes, as there will be the first time you play. What _is_ consistent is that the order of the colors is always the same. In other words, a blue note will always be higher than a green note from the same set.

Since the second set (notes 8 to 14) are all higher pitched than the first set, it's fairly obvious whether a note belongs to the first or second set. Therefore, the colors can be used to quickly determine what order that the notes need to played back.

What isn't quite so easy is remembering the placement of each note when the sequence starts getting long. A strategy would be to draw a copy of the 8x4 checkboard, then cut out thin cardboard markers numbered 1 to 14. As you go through the sequences, you would place the markers on the checkerboard so that you can keep track of which notes you had already covered and what order they needed to be played in.

Once you have them all, you just need to follow the sequence!
