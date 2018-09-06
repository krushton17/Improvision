# Welcome to Improvision!

Improvision is a web app designed to help learn and practice chord-tone guitar improvisation. It has been designed primarily with jazz improvisation in mind. This guide will help familiarize the user with the chord and song editing systems.

## Playback Dashboard

In the top-left corner of the area below the main diagram is the playback dashboard. It includes buttons to control the basic functions of song playback:

* **Play:** Plays the current song. During playback, the play button is replaced with the pause button. Most other GUI elements are disabled during playback.
* **Pause:** Pauses playback. Playback will resume from the beginning of the measure where it left off. Most other GUI elements will stay disabled. To reset the app to play the song from the beginning and to reenable the other GUI elements, use the stop button.
* **Stop:** Stops playback and reenables all other GUI elements. Playback will start from the beginning of the song.
* **Repeat:** Toggles repeat mode. When this is disabled, the song will play from start to finish according to the pattern identified in the "Pattern" control. When the end of the song is reached, playback stops. If repeat mode is enabled, the song will follow the pattern identified in the "Repeat Pattern" control. When the end of the song is reached, playback will continue from the beginning of the song.

## Song Editor

Improvision's song editor consists of a drag-and-drop interface as well as various controls to define the properties and components of the song. It also includes a text-based editor, which is less intuitive but faster and more powerful once it is understood.
Be careful when using the GUI, since there is no 'undo' feature. To avoid losing work, use the "GUI to text" button frequently. The text editor uses the browser's undo feature.

### Controls

* Song metadata:
    * **Title:** Name of the song.
    * **By:** Who wrote the song.
    * **Key:** The key signature of the song. This is expressed as the name of the tonic note and an 'm' or '-' if the song is in minor key. This is currently for reference only.
    * **Meter:** The song's time signature. Expressed as a ratio, e.g. 4/4, 12/8. Irregular time signatures (e.g. 7/4) should work fine, but nicknames such as 'C' for common time are not supported.
    * **Tempo:** Expressed as a number in beats per minute, e.g. 60. This stays enabled during playback, allowing the user to change the tempo while the song is playing.
* GUI/text conversion:
    * **Upload:** Upload a text file from the user's local storage. If the text file contains a valid song in Improvision's format, the editor will play the song contained in the file.
    * **Download:** Save the current song as a text file on the user's local storage. This allows the user to create their own song, save it on their own computer, and upload it the next time they use Improvision.
    * **Text to GUI:** Update the GUI with any changes made in the text editor.
    * **GUI to Text:** Update the text editor with any changes made in the GUI. Press this before downloading the file.
    * **Text editor:** The actual text editor. Its functionality is described in the next section of this guide.
* Section menu:
    * **Sections:** Contains one button for each section of the song. Click on the button to display the associated section. Double-click the button to change its name. Drag the button to the recycling bin to delete the section. Press the + button to add a new section.
    * **Pattern:** Defines the structure of the song when repeat mode is disabled. This allows the user to reuse repetitive portions of the song and implement the equivalent of codas, etc.
    * **Repeat Pattern:** Defines the structure of the song when repeat mode is enabled. If this is left blank, the regular pattern will be used in both modes.
* Song editor:
    * This is a **drag-and-drop** interface. Only one **section** of the song is displayed at a time. Each section is divided into **lines**; each line is divided into **measures**; each measure is divided into **beats**.
    * To **change the order of the lines**, click on the crossed arrow icon on the far left of the line and drag the line up or down. (There is currently a bug that only allows the user to move a line to the bottom of the section. I am aware of this bug and am working to fix it.)
        * To **delete** the line, drag it to the recycling bin.
        * To **add** a new line, press the + at the bottom of the section.
    * To **change the order of the measures** within a line, click on the crossed arrow icon on the left side of the box representing a measure and drag it to its new position. Measures can be dragged to different positions within the same line or to different lines.
        * To **delete** a measure, drag it to the recycling bin.
        * To **add** a new measure, press the + at the far right of the line you want to add it to.
    * To **change the order of the chords** within a measure, click on the chord and drag it to its new position. Chords can be dragged to different positions within the same measure or to different measures.
        * To **delete** a chord, drag it to the recycling bin.
        * To **add** a new chord, hover over the circle reprenting the beat you want to add it to; the circle will become a +. Click on the + and a new chord will appear.
        * You can also add a new chord by dragging a chord from the **chord menu**.
* Chord menu:
    * To the right of the song editor is the chord menu. This contains a list of all the chords used in the current song.
        * Chords can be dragged from the chord menu to the song editor, allowing the user to create many copies of the same chord without having to retype its name.
        * Unused chords can be dragged from the chord menu to the recycling bin to remove them from the menu.
        * Click on the + button at the top of the menu to add a new chord to the menu.
            * New chords added directly to the song editor are automatically added to the chord menu.
* Recycling bin:
    * Drag a section, line, measure, or chord to the recycling bin to delete it.

## Text Editor

Songs in Improvision are defined by text files that use the following format. When editing a song with the GUI, the song is converted to text format before being intepreted by the app for playback.

* **Metadata:** Each of the following is placed within parentheses prefaced by the name of the metadata component. Examples are given below:
    * **Title:** title(Summertime)
    * **By:** by(George Gershwin)
    * **Key:** key(Am)
    * **Meter:** meter(4/4)
        * Must be expressed as a ratio, e.g. 4/4, 12/8. Irregular time signatures (e.g. 7/4) should work fine, but nicknames such as 'C' for common time are not supported.
    * **Tempo:** tempo(120)
* **Patterns:** The names of the sections in the order in which they should be played. Section names are separated by commas. The pattern for single-play mode is bookended by semicolons. The pattern for repeat mode is bookended by colons.
    * Example of **single-play** pattern: ;A,B,A,C;
    * Example of **repeat** pattern: :A,B:
* **Song Content:** The song is subdivided into different components, as described below.
    * **Section:** Each song must contain at least one section. This is a container for the other song components and is useful for repeating or rearranging certain parts of the song.
        * **Format:** The **name** of the section can be any combination of alphanumeric characters (Aa-Zz, 0-9). The **content** of the section is placed between square brackets directly following the section name.
        * Example: A[Section A content goes here]
    * **Line:** Sections are subdivided into lines for easier reading. Lines are separated by line breaks (press enter/return).
    * **Measure:** The end of each measure is indicated by a vertical bar: |
        * The first measure of a line does not need to be preceded by a bar.
    * **Beats:** Chord changes occur on particular beats within a measure. Each beat is indicated by either the name of the chord falling on that beat, or a period (.) signifying a beat with no chord change.
        * Chord changes not separated by a period or a vertical bar should be separated by a single space.
        * If there is only one chord change on the first beat of a measure, the periods are unnecessary.
        * If there are no chord changes within the measure, the measure can be left empty, with successive vertical bars indicating the number of measures: ||

## Note Format

Notes in Improvision are identified by a single capital letter followed by a modifier, if applicable. Sharped notes are denoted with a #. Flatted notes are denoted by a lower-case b. The GUI will convert these to standard musical symbols for sharps and flats.

## Chord Format

For the most part, Improvision's chord format follows common conventions seen on lead sheets and tabs. The diagram displays both the actual chord tones as well as extensions that are commonly played over the chord while soloing. The different types of tones are color-coded as follows:

### Chord-tone color coding:

The chord tones on the diagram are color-coded as one of several categories: root note, guide tones, and explicit and implicit auxiliary tones.
* The **root note** is the foundation of the chord. All other chord tones are defined in relation to the root note. Depending on the style of music, the root may be emphasized or de-emphasized by the soloist or accompanist.
* **Guide tones** largely define the quality of the chord. Emphasizing the guide tones in your imporovisaiton will help highlight this quality. For most chords, the guide tones are the 3rd and 7th. The following exceptions apply:
    * In a **diminished** chord, **all** of the chord tones are guide tones.
    * In an **augmented** chord, the **#5** is included as a guide tone.
    * In an **altered chord**, the **flatted and sharped 5ths** are included as guide tones.
    * In a **suspended** chord, the **2nd** or **4th** replaces the 3rd as a guide tone.
    * In a **6th** chord, the guide tones are the **3rd** and **6th**.
* Any extensions or other modifiers specified in the chord name are labeled as **explicit auxiliary notes**; The notes help add tension and interest to the chord, but are not as essential in defining the character of the chord.
* Any extensions or other modifiers that are implied but *not* explicitly defined in the chord name are labeled as **implicit auxiliary notes**. These notes are defined by the defaults described in the Chord Format section above (based on jazz conventions). 
<!-- ^ eventually the user will be able to specify alternate scales to base the implicit auxiliary notes on. -->

### Common chord type examples:

For the most common types of chords, the chord names used in Improvision follow common conventions seen on lead sheets and guitar tabs. Some examples are displayed below.

|Chord name:  |Root:|Guide tones:|Explicit auxiliary tones:|Implicit auxiliary tones:|
| --- | --- | --- | --- | --- |
|CM7          |C   |E, B       |G           |D, F#, A    |
|Cm7 (C-7)    |C   |Eb, Bb     |G           |D, F, A     |
|C7           |C   |E, Bb      |G           |D, F#, A    |
|Cdim7        |C   |Eb, Gb, A  |            |D, F, Bb    |
|Cm7b5 (C-7b5)|C   |Eb, Bb     |Gb          |D, F, A     |
|Caug7 (C+7)  |C   |E, G#, Bb  |            |D, F#       |
|Calt7        |C   |E, Bb      |C#, D#, F#, G#, A|       |
|C6           |C   |E, A       |G           |D, F#, B    |
|Cm6 (C-6)    |C   |Eb, A      |G           |D, F, A     |
|Csus7        |C   |F, Bb      |G           |D, E, A     |

### Extensions and alterations:

 For more complex or unusual chord types, it helps to understand the logic behind Improvision's chord interpreter. This logic is described below. Currently the extensions connected to a particular chord are based on jazz conventions; in the future the user will be able to change this.

* **(Required) Root:** A letter indicating the root name of the chord. Use 'b' for flat and '#' for sharp: e.g. C, Bb, F#
    <!-- * **Slashed root:** To indicate an alternate bass note, add a '/' and the name of the note to the end of the chord name. -->
* **Major/minor quality:** 'm' indicates a minor 3rd. 'M' indicates a major 3rd. Ommiting this defaults to a major 3rd.
    * **Suspensions:** 'sus4' or simply 'sus' indicates a suspended chord; the 3rd is replaced with a perfect 4th. 'sus2' instead replaces the 3rd with a major 2nd.
* **Alterations:**
    * **Diminished chords:** 'dim' indicates a minor 3rd, a flatted 5th, and a diminished 7th (enharmonically equivalent to a 6th).
        * The flatted 5th can also be specified explicitly with 'b5'. For example, a half-diminished 7th can be indicated with 'm7b5'.
    * **Augmented chords:** '+' or 'aug' indicates a major 3rd and an augmented (sharped) 5th.
* **Extensions:** Odd-numbered scale tones from the 7th through 13th. Any specified extension implies all extensions below it; e.g. a 9 chord will include the 7th, making '97' redundant. The default values of extensions comply with jazz conventions, described below.
    * **Dominant:** Any chord that does not include an explicit minor or major quality will default to a dominant chord. The extensions of a default dominant chord are as follows: major 9th, minor 7th, sharp 11, natural 13.
    * **Minor:** 'm' with any extension implies a minor 7th chord. Default extensions are major 9th, minor 7th, natural 11, natural 13.
        * Minor-major: Default extensions for 'mM': major 9th, major 7th, natural 11, natural 13.
    * **Major:** 'M' with any extension implies a major 7th chord. Default extensions are major 9th, major 7th, sharp 11, natural 13.
    * **Alterations:** To alter any extension from the default value, include the number of the extension preceded by a '#' or 'b'.
* **Other:**
    * **6th chords:** Including a '6' in the chord name will exclude the 7th and any other extensions. To include the 6th as part of an extended chord, use '13' instead.
    * **Alt chord:** The 'alt' keyword provides a shorthand for an altered chord, which includes the flatted and sharped 9ths, the major 3rd, the flatted and sharped 5ths, and the minor 7th.

<!-- table for quality/extension interactions -->

<!-- |Chord Quality|2nd|3rd|4th|5th|6th|7th|8th|9th|11th|13th|
|-------------|---|---|---|---|---|---|---|---|----|----|
|m            |M  |m  |
|M            |M  |M  |
|mM           |M  |m  |
|sus,sus4,sus2|M  |   |
|dim          |M  |m  |
|aug          |M  |M  | -->

