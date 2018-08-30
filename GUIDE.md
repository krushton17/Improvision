# Welcome to Improvision!

## Chord Format

* **(Required) Root:** A letter indicating the root name of the chord. Use 'b' for flat and '#' for sharp: e.g. C, Bb, F#\
    * **Slashed root:** To indicate an alternate bass note, add a '/' and the name of the note to the end of the chord name.
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

## Song Editor: GUI

* Song metadata:
    * Title: Name of the song.
    * By: Who wrote the song.
    * Meter: The song's time signature. Expressed as a ratio, e.g. 4/4, 12/8. Irregular time signatures (e.g. 7/4) should work fine, but nicknames such as 'C' for common time are not supported.
    * Tempo: Expressed as a number in beats per minute, e.g. 60.
* Song Structure: Defines the order in which the sections of the song are played. This allows for repetition of certain sections of the song without having to spell them out. The user can also specify an alternate order for repeat mode; for example, the user may set the app to repeat a single section over and over in order to practice soloing.


## Song Editor: Text Format

Songs in Improvision are defined by text files that use the following format. When editing a song with the GUI, the song must be converted to text format before being intepreted by the app.

* Header: Contains song metadata. Placed between parentheses. Header components are separated by commas; spaces or line breaks will be interpreted as part of the component. Except for the title, this may render the component invalid. Header components must be presented in the right order. All components are required except for the optional swing parameter, although it is possible to leave a song untitled as long as there is one comma before the key signature.
(title,key signature,tempo,time signature,[optional]:swing)
<!-- * [Optional]:swing. If the word 'swing' is included here, the timer will interpret 8th notes as part of a triplet. For time signatures with an 8 in the denominator, 8th notes are automatically interpreted as part of a triplet, so including the swing parameter in a song with such a time signature has no effect. -->
* Sections: Describes the sequence of chords within each section. Repeats, codas, 1st and 2nd endings, etc., are all considered sections. There are no constraints on the length of a section. Expressed as a single, capitalized letter label followed by an opening bracket and ending with a closing bracket.
* Chord sequence: Chords are expressed in the format listed above. Each chord is followed by either a forward slash, indicating that the chord lasts the length of an entire measure, or a series of periods indicating the duration of the chord, with each period signifying one beat as defined by the time signature. For example, in 4/4 time, the period indicates a quarter note; Dm... represents a D minor chord that is held for three quarter notes. If periods are used, the slash indicating the end of a measure is optional. While a slash preceded by one or more periods is ignored by the parser, its use is recommended to improve human readability.