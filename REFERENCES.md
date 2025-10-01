## 📚 Reference Implementations

The original source code for _Impossible Mission_ was, according to the original designer Dennis Caswell, lost in an earthquake.

I'm recreating what I can from a disassembly of one of the Atari 7800 ROM images of the game, obliquely referenced [in this thread](https://forums.atariage.com/topic/153052-impossible-mission-successful-recompile-of-source-code/).

<ul>
  <li><a href="./assets/roms/mission.a78">Impossible Mission (Atari 7800 version; fixed)</a></li>
</ul>

The "fixed" part refers to the fact that the most infamous port of _Impossible Mission_ was the Atari 7800 version of the game that was released in North America. This version was also called the "NTSC version" and it couldn't be completed due to a bug. The glitch prevented you from acquiring certain key items from computer terminals because those terminals were not searchable. This was fixed in the subsequent "PAL version."

I also have two binary files for the Commodore 64.

<ul>
  <li><a href="./assets/roms/mission.tap">Impossible Mission (C64 tape version)</a></li>
  <li><a href="./assets/roms/mission.d64">Impossible Mission (C64 disk version)</a></li>
</ul>

Those implementations were generated from a "nibbled" disk image that I was able to reference as well as a `.sid` file.

<ul>
  <li><a href="./assets/roms/mission.nib">Impossible Mission (disk image)</a></li>
  <li><a href="./assets/roms/mission.sid">Impossible Mission (sid image)</a></li>
</ul>

The `.nib` file includes all the intricate details of the original disk, preserving the exact, bit-for-bit layout of original game. A NIB is usually not directly runnable in an emulator, but it can be converted into other, more compatible formats, such as the `.tap` and `.d64` formats that I used.

The `.sid` file is a self-contained music program that includes 6502 machine code to play sound. The file contains code that manipulates the registers of the Commodore 64's SID sound chip, allowing it to generate music by synthesizing waveforms. Essentially, a SID file is a miniaturized C64 that runs on a modern computer's emulated hardware to reproduce the original C64 music.

With all of the above references, I found the tools [Retro Debugger](https://github.com/slajerek/RetroDebugger) and [DirMaster](https://style64.org/dirmaster) to be immensely helpful!

<p align="center">
<img src="./assets/images/disassemble.jpg" width="1088" height="901" alt="Example of Impossible Mission being played in a debugger.">
</p>

I also referenced [Andrea Capitani's tribute to the game](https://github.com/acapitani/im), which was written in Go, for the Defold game engine. This helped me understand how someone interpreted the data structures of the game and broke out the various assets. I found this wasn't an entirely faithful reproduction of the game.

There is also a [remastered version on Steam](https://store.steampowered.com/app/1449480/Impossible_Mission_Revisited/) and this "revisited" version was useful to see in terms of how _not_ to do things. I say that because this version is riddled with bugs.
