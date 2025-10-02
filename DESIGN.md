# 🧩 Project Anatomy

_How the pieces fit together..._

Here I'll provide an overview of the project's internal landscape: the key pieces, their roles, and how they combine to form the bigger picture.

## 📐 Sprites

A typical sprite sheet structure is that individual sprites are extracted as separate, non-overlapping rectangles. Each element gets its own entry. There are generally no "composite" or "section" sprites that contain other sprites. That's _not_ the case with the sprite sheet I'm using.

<p align="center">
<img src="./assets/images/missionSprites.png" width="400" height="300">
</p>

That's an 800x600 sprite sheet but that's structured in a potentially interesting way:

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Top X</th>
      <th>Top Y</th>
      <th>Width</th>
      <th>Height</th>
      <th>Element</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>sprite1</td><td>0</td><td>0</td><td>497</td><td>339</td><td>top panel</td></tr>
    <tr><td>sprite2</td><td>708</td><td>0</td><td>64</td><td>112</td><td>elevator</td></tr>
    <tr><td>sprite3</td><td>499</td><td>1</td><td>48</td><td>21</td><td>puzzle, 1:col2</td></tr>
    <tr><td>sprite4</td><td>549</td><td>1</td><td>48</td><td>21</td><td>puzzle, 1:col3</td></tr>
    <tr><td>sprite5</td><td>599</td><td>1</td><td>48</td><td>21</td><td>puzzle, 1:col4</td></tr>
    <tr><td>sprite6</td><td>659</td><td>1</td><td>48</td><td>21</td><td>bpuzzle, 1</td></tr>
    <tr><td>sprite7</td><td>499</td><td>26</td><td>48</td><td>21</td><td>puzzle, 2:col2</td></tr>
    <tr><td>sprite8</td><td>549</td><td>26</td><td>48</td><td>21</td><td>puzzle, 2:col3</td></tr>
    <tr><td>sprite9</td><td>599</td><td>26</td><td>48</td><td>21</td><td>puzzle, 2:col4</td></tr>
    <tr><td>sprite10</td><td>659</td><td>26</td><td>48</td><td>21</td><td>bpuzzle, 2</td></tr>
    <tr><td>sprite11</td><td>499</td><td>51</td><td>48</td><td>21</td><td>puzzle, 3:col2</td></tr>
    <tr><td>sprite12</td><td>549</td><td>51</td><td>48</td><td>21</td><td>puzzle, 3:col3</td></tr>
    <tr><td>sprite13</td><td>599</td><td>51</td><td>48</td><td>21</td><td>puzzle, 3:col4</td></tr>
    <tr><td>sprite14</td><td>659</td><td>51</td><td>48</td><td>21</td><td>bpuzzle, 3</td></tr>
    <tr><td>sprite15</td><td>499</td><td>76</td><td>48</td><td>21</td><td>puzzle, 4:col2</td></tr>
    <tr><td>sprite16</td><td>549</td><td>76</td><td>48</td><td>21</td><td>puzzle, 4:col3</td></tr>
    <tr><td>sprite17</td><td>599</td><td>76</td><td>48</td><td>21</td><td>puzzle, 4:col4</td></tr>
    <tr><td>sprite18</td><td>659</td><td>76</td><td>48</td><td>21</td><td>bpuzzle, 4</td></tr>
    <tr><td>sprite19</td><td>499</td><td>101</td><td>48</td><td>21</td><td>puzzle, 5:col2</td></tr>
    <tr><td>sprite20</td><td>549</td><td>101</td><td>48</td><td>21</td><td>puzzle, 5:col3</td></tr>
    <tr><td>sprite21</td><td>599</td><td>101</td><td>48</td><td>21</td><td>puzzle, 5:col4</td></tr>
    <tr><td>sprite22</td><td>659</td><td>101</td><td>48</td><td>21</td><td>bpuzzle, 5</td></tr>
    <tr><td>sprite23</td><td>499</td><td>126</td><td>48</td><td>21</td><td>puzzle, 6:col2</td></tr>
    <tr><td>sprite24</td><td>549</td><td>126</td><td>48</td><td>21</td><td>puzzle, 6:col3</td></tr>
    <tr><td>sprite25</td><td>599</td><td>126</td><td>48</td><td>21</td><td>puzzle, 6:col4</td></tr>
    <tr><td>sprite26</td><td>659</td><td>126</td><td>48</td><td>21</td><td>bpuzzle, 6</td></tr>
    <tr><td>sprite27</td><td>499</td><td>151</td><td>48</td><td>21</td><td>puzzle, 7:col2</td></tr>
    <tr><td>sprite28</td><td>549</td><td>151</td><td>48</td><td>21</td><td>puzzle, 7:col3</td></tr>
    <tr><td>sprite29</td><td>599</td><td>151</td><td>48</td><td>21</td><td>puzzle, 7:col4</td></tr>
    <tr><td>sprite30</td><td>659</td><td>151</td><td>48</td><td>21</td><td>bpuzzle, 7</td></tr>
    <tr><td>sprite31</td><td>499</td><td>176</td><td>48</td><td>21</td><td>puzzle, 8:col2</td></tr>
    <tr><td>sprite32</td><td>549</td><td>176</td><td>48</td><td>21</td><td>puzzle, 8:col3</td></tr>
    <tr><td>sprite33</td><td>599</td><td>176</td><td>48</td><td>21</td><td>puzzle, 8:col4</td></tr>
    <tr><td>sprite34</td><td>659</td><td>176</td><td>48</td><td>21</td><td>bpuzzle, 8</td></tr>
    <tr><td>sprite35</td><td>499</td><td>201</td><td>48</td><td>21</td><td>puzzle, 9:col2</td></tr>
    <tr><td>sprite36</td><td>549</td><td>201</td><td>48</td><td>21</td><td>puzzle, 9:col3</td></tr>
    <tr><td>sprite37</td><td>599</td><td>201</td><td>48</td><td>21</td><td>puzzle, 9:col4</td></tr>
    <tr><td>sprite38</td><td>659</td><td>201</td><td>48</td><td>21</td><td>bpuzzle, 9</td></tr>
    <tr><td>sprite39</td><td>0</td><td>228</td><td>800</td><td>372</td><td>bottom panel</td></tr>
  </tbody>
</table>

<p align="center">
<img src="./assets/images/spritesheet-composite.png" width="461" height="337">
</p>

You can see there how the red and tan areas overlap many sprites. Some elements (the puzzle pieces, or white boxes, for example) are broken out into individual sprites, while others (the top and bottom panels) are treated as single large blocks. Only certain elements from the top and bottom panels are individually defined, leaving others embedded in the composite.

This sprite sheet was reverse-engineered from the original game data. Keep in mind that the original 1984 game didn't have had a "sprite sheet" like this at all. Graphics were stored in memory-efficient formats specific to the Commodore 64's VIC-II chip. The above PNG is a reconstruction based on that underlying data. Basically, I extracted the graphics data from the original Commodore 64 game files.

Regardless of the fact that the sprite sheet has overlapping/composite regions, the basic procedure is the same as with any other sprite sheet: crop by coordinates. I have to extract rectangular regions using the x, y, width, height values. The composite nature just means that I have redundant data (same pixels defined multiple times) and I will need to make intelligent choices about which sprites to actually use.

### Sprite Processing

The `gameSprites` variable on the Engine class is my source spritesheet image, which is loaded from the extracted game data. I create a canvas matching the sprite dimensions and then I draw the spritesheet and extract its raw pixel data into `baseSpritePixels`. Then I can generate new sprite images with different emulator palettes.

My `gameSprites` image was created with the source palette colors, so when I extract the pixel data, I get colors matching the source palette. When I call the `swapSpritePalette()` function, that maps those source colors to the target palette.

The Commodore 64 had a limited set of available colors that could be used for its graphics. These colors were defined by their hexadecimal values, and different games and applications for the Commodore 64 would use specific color combinations to achieve their desired visual effects. Certain emulators (VICE, CCS64, C64HQ, C64S, and PC64) all made their own choices on the palette. In my context, those choices will be provided as possible color palettes for the game.

The Commodore 64 had exactly sixteen colors in its palette, and I've represented all sixteen for each emulator variant. The array indices (0-15) naturally correspond to the Commodore 64's color numbers:

```
0 = Black
1 = White
2 = Red
3 = Cyan
4 = Purple
5 = Green
6 = Blue
7 = Yellow
8 = Orange
9 = Brown
10 = Light Red
11 = Dark Grey
12 = Grey
13 = Light Green
14 = Light Blue
15 = Light Grey
```

The `source` palette is my source/reference palette, meaning it's the palette that my `baseSpritePixels` was originally encoded with when I extracted it from the game image data. When I call `getImageData()`, I get an ImageData object that has a .data property. That property is a Uint8ClampedArray, which is a special type of array that stores pixel color data. The array stores pixels in RGBA format, with four consecutive values per pixel:

```
[ R, G, B, A,   R, G, B, A,   R, G, B, A, ... ]
 |--Pixel 0--| |--Pixel 1--| |--Pixel 2--| ...
```

For example, a bright red pixel with full opacity:

```
[255, 0, 0, 255] // Red=255, Green=0, Blue=0, Alpha=255
```

So, I'm essentially reading every group of four values as one complete pixel, comparing its RGB values to find which palette color it matches, then swapping it out.

The simple way to explain all of this is that I extracted sprite data from the original _Impossible Mission_ game. That extracted data uses the `source` palette as its color encoding. The `swapSpritePalette()` function then does the following:

- Loops through each pixel in `baseSpritePixels`.
- Finds which color index (0-15) it matches in the `source` palette.
- Replaces it with the corresponding color from the target palette (e.g., vice).

### Game Canvas

I have a canvas with attributes of `width="960" height="600"`. The CSS for the canvas element, however, has attributes of `width: 320px; height: 200px;`. The attributes on the canvas define the intrinsic resolution of the canvas, meaning the number of pixels in the canvas's internal coordinate system (its drawing surface). This is the actual pixel grid used for rendering content via the canvas's 2D or WebGL context.

The CSS values control the display size of the canvas element in the browser, referring to how large it appears on the page in CSS pixels. The canvas will be scaled to fit these dimensions, stretching or compressing the intrinsic resolution to match the CSS size.

The browser will scale the 960x600 pixel canvas to fit within the 320x200 CSS pixel area. This means the canvas's content is compressed by a factor of 3 (960/320 = 3 for width, 600/200 = 3 for height). Why do all this? By setting a higher intrinsic resolution (960x600) than the display size (320x200), I can make sure that the canvas has more pixels to work with, improving clarity on high-DPI screens, like Retina displays. The browser scales the high-resolution canvas down to the CSS size, making graphics appear crisp rather than blurry. In this case, a 960x600 canvas scaled to 320x200 CSS pixels has a 3x pixel density, ideal for modern displays with 2x or 3x pixel ratios.

Importantly for me, since I'm using a spritesheet, a larger intrinsic resolution allows for detailed rendering without needing to dynamically resize assets. The browser handles scaling, which can be more efficient than rendering at a lower resolution and upscaling. For _Impossible Mission_, with its platformer-style rooms and sprites, a higher internal resolution ensures smooth animations and sharp visuals when scaled to a smaller display size.

The dimensions (960x600 and 320x200) maintain the same aspect ratio (1.6:1). This ensures the game’s visuals aren't distorted when scaled. For a game like _Impossible Mission_, maintaining the aspect ratio is crucial for consistent level design and sprite proportions across different screen sizes.

## 📐 Sound Files

The Commodore 64 used the SID chip (Sound Interface Device, MOS 6581/8580), which was revolutionary for its time. Sound isn't stored as audio files but instead as two things: music/sound data (note sequences, instrument parameters, waveforms) and a player routine, which was 6502 code that interpreted the data and programmed the SID registers.

What I did is I ran an original image of the game in an emulator with debugging. While doing that, I was able to monitor the SID chip registers (D400-D41C) and capture the register writes to understand the music structure. Then I located the music player routine in the disassembled code, found the music data tables, and extracted all that to package it as a standalone `.sid` file. Once I had that, I could play that file in an emulator/player, record the audio output, and convert the output to an OGG format.

It's worth noting that with this process I'm essentially converting from synthesized/chip music to sampled audio. The `.sid` files are very tiny but the resulting OGG files are quite a bit larger, even when compressed. What you lose here is a bit of the "authentic SID chip sound" flexibility.

In the end, this process netted forty-two specific audio files. That really showcases the efficiency and sophistication fo the Commodore 64 sound design! Each "sound" in the `.sid` is really just a set of parameters: waveform type, ADSR envelope, frequency sweep, and filter settings. The SID chip synthesizsed these in real-time. This means there was a very tiny data footprint. Each sound effect was just a few bytes of parameters. One player routine serviced all the sounds and, thus, different sounds had different parameter sets fed to the same code. This is like having forty-two "presets" for a synthesizer versus forty-two pre-recorded audio files.
