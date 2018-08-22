//CHORDS & NOTES-------------------------------------------------------------------------------------------------------

let sharpKeys = ['C', 'C#', 'D', 'E', 'F#', 'G', 'A', 'B'];

let notes = {
    0:  [,'A',],
    1:  ['A#',,'Bb'],
    2:  [,'B','Cb'],
    3:  ['B#','C',],
    4:  ['C#',,'Db'],
    5:  [,'D',],
    6:  ['D#',,'Eb'],
    7:  [,'E','Fb'],
    8:  ['E#','F',],
    9:  ['F#',,'Gb'],
    10: [,'G',],
    11: ['G#',,'Ab']
}

let intervals = {
    0: ['uni'],
    1: ['b9'],
    2: ['2', '9'],
    3: ['m3', '#9'],
    4: ['M3'],
    5: ['4', '11'],
    6: ['#11', 'b5'],
    7: ['5'],
    8: ['b6', 'b13', '#5'],
    9: ['6', '13', 'dim7'],
    10: ['m7'],
    11: ['M7']
}

let randomizer = 0;

class Chord {
    /*
    constructor creates:
        this.root
            as of now, this is the text name of the root.
            !what about altered roots?
                - maybe 'bass' is different from 'root'
                - this would affect guide tones...
        this.notes
            all notes in the chord, explicit and implicit
        this.guides
            guide tones, to prioritize for harmony
        this.auxExp
            explicit 5th, extensions, etc.,
            which are lower priority than guide tones
            specifying the explicit ones allows these
                to prevent being overriden by scale changes
        this.auxImp
            implicit extensions, subject to being
            overriden by selection of an alternate scale
        !make each note an object, including its relationship to root?
        !add attribute for attached scale?
    */

    //construct new chord from a string descriptor
    constructor(str) {
        //!add verification of valid string
        //!add something for 'nc'

        //root = TEXT NAME of root note
        this.root = str.match(/^[A-G][#b]?/g)[0];
        let guides = [];
        let auxExp = [];
        let auxImp = [];
        
        //exceptional chords
        if (/dim/.test(str)) {
            guides.push('m3', 'b5', 'dim7');
            auxExp.push('uni');
        } else if (/alt/.test(str)) {
            guides.push('M3', 'b5', '#5', 'm7');
            auxImp.push('b9', '#9');
        //all other, 'normal' chords
        } else {
            //find 9th, 3rd, 11th; if sus, find 2nd, 3rd, 4th
            let sus = str.match(/sus[24]?/g);
            let minorQual = /m/.test(str);
            switch (sus) {
                case 'sus2':
                    guides.push('2');
                    auxExp.push('4');
                    auxImp.push('M3');
                    break;
                case 'sus4':
                case 'sus':
                    guides.push('4');
                    auxExp.push('2');
                    auxImp.push('M3');
                    break;
                default: 
                    //find 9th
                    {
                        let match = str.match(/[#b]?9/g); //block scoped
                        if (match) {
                            auxExp.push(match);
                        } else { auxImp.push('9'); }
                    }
                    //find 3rd
                    guides.push(minorQual ? 'm3' : 'M3');
                    //find 11th; depends on minorQual, imp or exp depending on str
                    if (/11/.test(str)) {
                        auxExp.push(minorQual ? '11' : '#11');
                    } else {
                        auxImp.push(minorQual ? '11' : '#11');
                    }
            } //end of switch block for sus detection
            //find 5th
            if (/b5/.test(str)) {
                guides.push('b5'); //aug, m6 dealt with later
            } else if (/aug|\+/.test(str)) {
                guides.push('#5');
            } else {
                auxExp.push('5');
            }
            //find 6th and 7th
            if (/6/.test(str)) {
                guides.push('6');
                auxImp.push(minorQual ? 'm7' : 'M7');
            } else {
                let seventh = /M/.test(str) ? 'M7': 'm7';
                guides.push(seventh);
                if (/b?13/.test(str)) {
                    auxExp.push(str.match(/b?13/));
                } else if (!(/aug|\+/.test(str) && seventh == 'm7')) { //if the expression in parentheses is true, there is no 6th/13th
                    auxImp.push('13');
                }
            }
        } //end of if block checking for exceptional chords

        //['uni'] because the root usually does not appear in the other arrays
        let notes = ['uni'].concat(guides, auxExp, auxImp);
        
        //sort notes by their numerical value and remove duplicates;
        //the other arrays are already sorted
        this.notes = Array.from(new Set(notes.sort(function(a, b) {
            return encodeInterval(a) - encodeInterval(b);
        })));
        this.guides = guides
        this.auxExp = auxExp
        this.auxImp = auxImp
        
        this.fretMap = this.mapToFrets();
    } //end of constructor

    //match the chord tones to their position on the fretboard
    mapToFrets() {
        //create empty object to store notes, grouped by string
        let notes = {};
        //loop through the strings by root name
        for (let i of instrument.strings) {
            //create empty array to store notes for each string
            notes[i] = [];
            //convert string root letter to number
            let openNote = encodeNote(i.toUpperCase());
            //loop through frets
            for (let fret = 1; fret <= instrument.fretNumber-1; fret++) {
                //at each fret, loop through the chord tones to see if they match
                for (let interval of this.notes) {
                    //note = absolute number value of the note played by that fret
                    //!use the normalize function?
                    let note = openNote + fret;
                    //keep note value between 0:11
                    note %= 12;
                    //convert interval name to number
                    let intNum = encodeInterval(interval);
                    //convert interval to absolute note by adding to the root
                    intNum += encodeNote(this.root);
                    //keep note value between 0:11
                    intNum %= 12;
                    //if this fret is part of the chord,
                    //  add the name of the interval to the set of scale degrees.
                    //  this way d3 can display the interval name; the actual note name is irrelevant rn.
                    if (intNum == note) {
                        notes[i].push({
                            'fret': fret,
                            'interval': interval,
                        });
                    }
                }//end of interval iterator
            }//end of fret iterator
        }//end of string iterator
        return notes;
    }//end of notesRel function
}//end of Chord class definition

//NOTE ENCODING & PARSING----------------------------------------------------------------------------------------------

//get a note number from a letter name
let encodeNote = function(str) {
    for (let i in notes) {
        if (notes[i].includes(str)) {
            return +i;
        }
    }
}

//get a note letter name from a number
//  default is to give absolute number;
//  interval can be given by specifying a different root
//!this doesn't do a good job of deciding on sharps or flats
let parseNote = function(note, root='A') {
    if (notes[note][1] !== undefined) {
        //if there is a natural value, use that
        return notes[note][1];
    } else if (sharpKeys.includes(root)) {
        //if the root note defaults to sharp keys, use that
        return notes[note][0];
    } else {
        //otherwise, express in flats
        return notes[note][2];
    }
}

//parse an array of notes
let parseNotes = function(array, root='A') {
    return array.map(x => parseNote(x, root));
}

//convert a text interval to a number
let encodeInterval = function(str) {
    for (let i in intervals) {
        if (intervals[i].includes(str)) {
            return +i;
        }
    }
}

//encode an array of intervals
let encodeIntervals = function(array) {
    return array.map(x => encodeInterval(x));
}

//convert from relative notes to absolute notes
let normalize = function(chord, root) {
    return chord.map(note => {
        note += encodeNote(root);
        note %= 12;
    });
}

//SONG CLASS DEF--------------------------------------------

class Song {
    constructor(text) {
        //!!add validation & errors
        let header = text.slice(text.indexOf('(')+1, text.indexOf(')')).split(',');
        this.title = header[0];
        this.key = header[1];
        this.tempo = header[2];
        this.meter = (function() {
            //numerator
            let beatsPerMeasure = +header[3].match(/^\d+/)[0];
            //denominator
            let beatUnits = +header[3].match(/\d+$/)[0];
            if (beatUnits == 8) {
                beatsPerMeasure /= 3;
            }
            //swing boolean
            //let swing = header[4] && header[4] == 'swing';
            return {
                beatsPerMeasure: beatsPerMeasure,
                beatUnits: beatUnits,
                //swing: swing
            };
        })();//end of meter parsing
        this.singleStruct = /;.*;/.exec(text)[0].slice(1,-1).split(',');
        this.repeatStruct = /:.*:/.exec(text)[0].slice(1,-1).split(',');
        //create empty variables to store iteration results
        this.components = {};
        //iterate through sections, then through the chords, etc.
        let sections = {};
        //extract the text strings representing each section
        //!!for some reason, trying to match more than one letter with + or * produces an error...
        let sectionText = text.match(/\w+\[[^\[\]]+\]/g);
        //loop through the sections and parse their components
        for (let string of sectionText) {
            //label = anything that comes before the [
            let label = string.slice(0, string.indexOf('['));
            //initialize empty array to hold the chord sequence
            let chordSeq = [];
            //slice the string into lines
            let lines = string.slice(string.indexOf('[')+1,-1).split('\n');
            //loop through the lines
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];
                //slice the line into measures
                let measures = line.slice(0,-1).split('|');
                //loop through the measures
                for (let j = 0; j < measures.length; j++) {
                    let measure = measures[j];
                    //divide the measure into its components
                    //  the components are either chords or periods (.)
                    //  chords can also be separated by spaces if there is not a spacer between them!
                    let beats = measure.match(/[^ \.]+|\./g)
                    //if there are no matches, create an empty array
                    if (!beats) {
                        beats = [];
                    }
                    //if there is too much information in the measure, generate an error message
                    if (beats.length > this.meter.beatsPerMeasure) {
                        console.log('This measure was truncated because it was too long!')
                    }
                    //set the length of the array to the number of beats in each measure
                    beats.length = this.meter.beatsPerMeasure;
                    //loop through the components
                    for (let i = 0; i < beats.length; i++) {
                        //for consistency, take out the periods
                        if (beats[i] == '.') { beats[i] = undefined; }
                        //add the components of this measure to the end of the chord sequence
                        chordSeq.push(beats[i])
                    }
                    measures[j] = beats;
                }
                lines[i] = measures;
            }
            //for translating the text into GUI elements
            this.components[label] = lines;
            //for the timer
            sections[label] = chordSeq;
        }
        //generate raw chord sequences by beat for single-play and repeat modes
        this.singleSeq = this.constructSequence(this.singleStruct, sections);
        this.repeatSeq = this.constructSequence(this.repeatStruct, sections);
        //generate a library of all unique chords and their intervals
        this.chordLibrary = this.constructChordLib(sections);
    }//end of constructor

    constructSequence(sectionOrder, sections) {
        let constructedSeq = [];
        for (let i = 0; i < sectionOrder.length; i++) {
            let section = sections[sectionOrder[i]];
            if (!section) continue;
            for (let chordSeq of section) {
                constructedSeq.push(chordSeq);
            }
        }
        return constructedSeq;
    }//end of chord sequence constructor

    constructChordLib(sections) {
        let chordLibrary = {}
        //set.add will skip duplicate values
        let chordLibKeys = new Set();
        //get the labels of all sections, then loop through them
        let sectionLabels = Object.keys(sections);
        for (let label of sectionLabels) {
            //use the section labels to loop through the chord sequences
            let sequence = sections[label];
            for (let e of sequence) {
                //skip undefined values
                if (e) {
                    //add each unique chord to the list of library keys
                    chordLibKeys.add(e);
                }
            }
        }
        for (let key of chordLibKeys) {
            //create an actual chord object and store it in the library object
            chordLibrary[key] = new Chord(key);
        }
        return chordLibrary;
    }//end of chord library constructor
}//end of Song class declaration

//DIAGRAM STUFF-------------------------------------------------------------------------------------------------------

//instrument specs
let instrument = {
    name: 'guitar',
    strings: ['E', 'A', 'D', 'G', 'B', 'e'],
    fretNumber: 23,
    //placeholders for possible later functionality;
    //  not currently referenced anywhere
    doubleStrings: false,
    shortenedString: false,
}

//add a function to change the diagram if you change instruments
let diagram = {
    //reference numbers for diagram proportions
    //x-coord of the nut
    nutPos: 50,
    //space between strings
    stringSpacing: 40,
    //circle size as a ratio of string spacing
    circleScaleFactor: .85,
    //apply scaling factor
    get radius() {
        return this.stringSpacing/2*this.circleScaleFactor;
    },
    //width of one fret
    fretWidth: 100,
    //width of the entire fretboard
    get fretBoardWidth() {return this.fretWidth*instrument.fretNumber},
    //distance between top and bottom strings
    get fretBoardHeight() {return this.stringSpacing*(instrument.strings.length-1)},
    //create scaling function for x axis
    get xScale() {
        return d3.scaleLinear()
            .domain([0, instrument.fretNumber -1])
            .range([0, this.fretBoardWidth]);
    },
    //create scaling function for y axis
    get yScale() {
        return d3.scaleLinear()
            .domain([0, instrument.strings.length -1])
            .range([this.stringSpacing/2 + this.fretBoardHeight, this.stringSpacing/2])
    },

    //set up the blank diagram
    setup: function() {
        //!!add something to clear the diagram if changing instruments or resizing it
        //avoid a 'this' conflict when calling these inside d3 functions
        let xScale = this.xScale;
        let yScale = this.yScale;
        let radius = this.radius;

        //set diagram height to hide scrollbar on fretboard
        d3.select('#diagram')
            //1.5 extra string spacing provides just enough room for the notes and the fret numbers
            .style('height', this.fretBoardHeight + this.stringSpacing*1.5)

        //create head
        let head = d3.select('#head')
            .attr('width', this.nutPos)
            .attr('height', this.fretBoardHeight + this.stringSpacing)
        //add line for nut
        head.append('line')
                .attr('class', 'fret')
                .attr('x1', this.nutPos-1.5)
                .attr('x2', this.nutPos-1.5)
                .attr('y1', yScale(0))
                .attr('y2', yScale(instrument.strings.length-1))
        //create groups for each string label
        let stringLabels = head.selectAll('g')
                .data(instrument.strings)
            .enter().append('g')
                //!magic number 2 == stroke
                .attr("transform", function(d, i) { return `translate(${radius + 2},${yScale(i)})`});
        //add string lines underneath note circles
        stringLabels.append('line')
                .attr('class', 'strings')
                .attr('x1', 0)
                .attr('x2', this.nutPos);
        //add note circles
        stringLabels.append('circle')
                .attr('class', 'note-circle head')
                .attr('r', radius)
                .attr('cx', 0);
        //add note names
        stringLabels.append('text')
                .attr('class', 'note-text')
                .attr('y', 5)
                .text(function(d) {return d;})
    
        //create fretboard
        //set fret-container height; extra height hides scrollbar
        d3.select('#fret-container')
            .style('height', this.fretBoardHeight + this.stringSpacing*3)
        //store selection in variable
        let fretBoard = d3.select('#fretboard');
        //set fretBoard dimensions
        fretBoard.attr('width', this.fretBoardWidth)
            //the extra height here is for the fret number labels
            .attr('height', this.fretBoardHeight + this.stringSpacing*2)
            .attr('left', this.nutPos);
        //add color markers for key frets
        fretBoard
            .append('g')
                .attr('id', 'markers')    
                .selectAll('.marker')
                .data([3, 5, 7, 9, 12, 15, 17, 19, 21])
            .enter().append('rect')
                //marker #12 is styled differently
                .attr('class', function(d) {
                    return d == 12 ? 'marker12' : 'marker';
                })
                .attr('x', function(d) { return xScale(d-1);})
                .attr('width', this.fretWidth + 3)
                .attr('y', this.stringSpacing/2)
                .attr('height', this.stringSpacing*(instrument.strings.length-1));
        //add lines for frets
        fretBoard
            .append('g')
                .attr('id', 'frets')
                .selectAll('.fret')
                .data(d3.range(1, instrument.fretNumber))
            .enter().append('line')
                .attr('class', 'fret')
                .attr('x1', function(d) { return xScale(d); })
                .attr('x2', function(d) { return xScale(d); })
                .attr('y1', yScale(0))
                .attr('y2', yScale(instrument.strings.length-1));
        //add fret labels at bottom
        fretBoard
            .append('g')
                .attr('id', 'fret-labels')
                .selectAll('text')
                .data(d3.range(1, instrument.fretNumber))
            .enter().append('text')
                //!change this to class: fret labels
                .attr('class', 'note-text')
                .attr('x', function(d) { return xScale(d-.5); })
                .attr('y', yScale(-1))
                .text(function(d) {return d;});
        //add strings
        fretBoard
            .append('g')
                .attr('id', 'strings')
                .selectAll('g')
                .data(instrument.strings)
            .enter().append('g')
                .attr('class', 'string-container')
                .attr("transform", function(d, i) { return `translate(0,${yScale(i)})`})
            .append('line')
                .attr('class', 'strings')
                .attr('x1', 0)
                .attr('x2', this.fretBoardWidth);
        fretBoard
            .append('g')
                .attr('id', 'note-container')
    },//end of diagram setup function

    //chordData: chord, fadeIn, duration
    update: function(chord, fadeIn, duration) {
        //put this in a format d3 can use
        let chordData = {
            chord: chord,
            fadeIn: fadeIn,
            duration: duration
        }
        //avoid a 'this' conflict when calling these inside d3 functions
        let xScale = this.xScale;
        let yScale = this.yScale;
        let radius = this.radius;
        //give each note a unique identifier;
        //  every note is always in the enter() selection
        let keyFunc = function(d) {
            randomizer %=1000;
            return ++randomizer;
        }

        //create <g> to hold all circles, text for a given set of notes
        let noteSet = d3.select('#note-container').selectAll('g')
            .data([chordData], keyFunc)
            .enter().append('g')

        //set the fade-in and duration of the new noteSet
        noteSet
            .attr('class', 'note-set')
            .style('opacity', 0)
            //1st transition: fade-in
            .transition()
                .duration(function(d) {
                    return d.fadeIn;
                })
                .on('start', function() {
                    //move to back;
                    //  keeps current chord's notes in front of next chord's notes
                    var firstChild = this.parentNode.firstChild; 
                    if (firstChild) { 
                        this.parentNode.insertBefore(this, firstChild); 
                    } 
                }).style('opacity', .5)
                //2nd transition: fully opaque
                .transition()
                    .duration(0)
                    .style('opacity', 1)
                    //final transition: remove
                    .transition()
                        .duration(function(d) {
                            return d.duration;
                        })
                        .remove();

        //append <g> for each string;
        //  makes it easier to set the notes' y values
        noteSet.selectAll('g')
            .data(instrument.strings)
            .enter().append('g')
                .attr("transform", function(d, i) { return `translate(0,${yScale(i)})`})
            .each(function(d) {
                let notes = d3.select(this).selectAll('g')
                    //switch to using the note data instead of string data
                    .data(chordData.chord.fretMap[d])
                    //append <g> for each note;
                    //makes it easier to set x values
                    .enter().append('g')
                    .attr("transform", function(d, i) { return `translate(${xScale(d.fret-.5)},0)`})

                //append circles
                notes.append('circle')
                    .attr('class', function(d) {
                        //use css to style the different scale degrees
                        let noteClass = 'note-circle';
                        if (d.interval == 'uni') {
                            noteClass += ' root'; 
                        } else if (chord.guides.includes(d.interval)) {
                            noteClass += ' guides';
                        } else if (chord.auxExp.includes(d.interval)) {
                            noteClass += ' auxExp';
                        } else {
                            noteClass += ' auxImp';
                        }
                        return noteClass;
                    })
                    .attr('r', radius)
                //append text
                notes.append('text')
                        .attr('class', 'note-text')
                        .attr('y', 5)
                       //convert to most readable language
                       .text(function(d) {
                           return textToSymbol(d.interval)
                       })
            })//end of 'each' block
    },//end of update function
}//end of diagram class definition

//initialize diagram
diagram.setup();

//TIMING------------------------------------------------------------------------------------------------------------

class SongNav {
    get section() {
        return song.components[this.structure[this.sectionIndex]];
    }
    get sectionName() {
        return this.structure[this.sectionIndex];
    }
    get line() { return this.section[this.lineIndex]; }
    get measure() { return this.line[this.measureIndex]; }
    get chord() { return this.measure[this.beatIndex]; }

    //!!cleaner to have an index object with properties named 'section', 'line', etc.?

    constructor(previous) {
        this.sectionIndex = previous ? previous.sectionIndex : 0;
        this.lineIndex = previous ? previous.lineIndex : 0;
        this.measureIndex = previous ? previous.measureIndex : 0;
        this.beatIndex = previous ? previous.beatIndex : 0;
        //do this here so toggling repeat mid-playback doesn't have any effect
        this.structure = previous ? previous.structure : timer.repeat ? song.repeatStruct : song.singleStruct;
    }// end of constructor

    increment(nextChord=false) {
        let steps = 0;
        //closure
        //return function(steps=0) {
        do {
            if (++this.beatIndex >= this.measure.length) {
                this.beatIndex = 0;
                this.measureIndex++;
                if (this.measureIndex >= this.line.length) {
                    this.measureIndex = 0;
                    this.lineIndex++;
                    if (this.lineIndex >= this.section.length) {
                        this.lineIndex = 0;
                        this.sectionIndex++;
                        if (this.sectionIndex >= this.structure.length &&timer.repeat) {
                                this.sectionIndex = 0;
                        }
                    }
                }
            }
            //count the number of times the do block is executed
            steps++;
        }
        //repeat the do block if the nextChord parameter is true and if we have yet to find a chord
        while (nextChord && !this.chord);
        //return the number of times the do block was executed (if nextChord is true, this is the number of beats until the next chord)
        return steps;
    }
}// end of SongNav definition

let timer = {
    //!!quick and dirty
    swing: false,
    repeat: true,
    //find out how many counts per beat
    get countsPerBeat() {
        //!!pull this from the input
        //if the time signature is in 8ths, 1 count per beat is enough
        //  otherwise 3 or 4, depending on whether swing == true
        return song.meter.beatUnits == 8 || this.swing ? 3 : 4;
    },
    //convert tempo to milliseconds (factoring in counts per beat)
    get tempoMil() {
        return 60000/((+document.getElementById('tempo').value)*this.countsPerBeat);
    },
    //!!change this to MIDI so it syncs better, etc.
    get metronome() {
        return new Audio('click.mp3');
    },

    //reset everything to zero; for use by the stop button
    //!!create partial reset for pause
    //!!will need to set the countIn relative to
    //  the beginning of the current measure for pause
    reset: function(hard=false) {
        this.countIn = song.meter.beatsPerMeasure;
        // this.countIn = -1*+document.getElementById('count-in').value * this.countsPerBeat
        this.counter = 0;
        this.beatIndex = 0;

        if (hard) {
            this.currentPos = new SongNav;
            //!!this should all be redundant now; no longer used
            // this.sectionIndex = 0;
            // this.lineIndex = 0;
            // this.measureIndex = 0;
        } else {
            this.currentPos.beatIndex = 0;
        }
        this.currentGUIel = {};
        //remove any existing note sets
        //!!should be redunant now (why?)
        d3.selectAll('.note-set').remove();
    },//end of reset function

    get structure() {
        return this.repeat ? song.repeatStruct : song.singleStruct;
    },
    get section() {
        return song.components[this.structure[this.sectionIndex]];
    },
    get line() {
        return this.section[this.lineIndex];
    },
    get measure() {
        return this.line[this.measureIndex];
    },
    get beat() {
        return this.measure[this.beatIndex];
    },

    altStep: function() {
        //increment counter and see if we're at a beat change
        if (this.counter++ % this.countsPerBeat != 0) { return; }
        //equivalent to resetting it to 0 and then incrementing it
        this.counter = 1;

        //play metronome here?

        //the chord that starts on this beat
        let currentChord = song.chordLibrary[this.currentPos.chord];

        //prepare for the next chord
        let findNext = new SongNav(this.currentPos);
        let beatsToNext = findNext.increment(true);
        let nextChord = song.chordLibrary[findNext.chord];
        
        if (this.countIn) {
            //only do this on the first beat of the countIn
            if (this.countIn == song.meter.beatsPerMeasure) {
                let fadeIn = song.meter.beatsPerMeasure * this.countsPerBeat * this.tempoMil;
                let duration = beatsToNext*this.countsPerBeat*this.tempoMil;
                diagram.update(currentChord, fadeIn, duration)
            }
            //count down until countIn is falsy
            this.countIn--;
        } else {
            //if there is a chord change on this beat
            if (currentChord) {
                //find the NEXT next chord so we know how long the next chord should be displayed on the diagram
                let findNextNext = new SongNav(findNext);
                let beatsToNextNext = findNextNext.increment(true);

                let fadeIn = beatsToNext*this.countsPerBeat*this.tempoMil;
                let duration = beatsToNextNext*this.countsPerBeat*this.tempoMil;
                diagram.update(nextChord, fadeIn, duration);

                //play chord
                audio.play(currentChord);

                //update GUI
                this.matchGUItoChordAlt()
            }
            //either way, move to the next beat
            this.currentPos.increment();
            if (!this.repeat && this.currentPos.sectionIndex >= this.currentPos.structure.length) {
                this.stop();
            }
        }//end of 'if countIn' block
    },//end of altStep function
    
    //increment the counter and update the diagram
    step: function() {

        //update the marquis textbox
        this.marquis();
        //if it's a fraction of a beat, increment and skip to the next count
        if (this.counter % this.countsPerBeat != 0) {
            return ++this.counter;
        }

        //!add a way to choose which sequence to use
        let sequence = song.singleSeq;

        //get the beat number from the counter
        let beat = this.counter/this.countsPerBeat;

        //if there isn't a chord change on the current beat
        //  the second expression here solves the problem of
        //  skipping the first chord
        if (!sequence[beat] && this.counter != this.countIn) {
            return ++this.counter;
        }

        //I don't currently use this, but it may be useful
        //  for when I add MIDI accompaniment
        let currentChord = song.chordLibrary[sequence[beat]];
        //supposed to play the chord
        if (currentChord) {
            audio.play(currentChord);
        }
        
        //look for the next chord to start the fade-in
        let nextIndex = this.findNextChord(sequence, beat);
        let nextChord = song.chordLibrary[sequence[nextIndex]];
        let beatsToNext = nextIndex - beat;
        beatsToNext %= sequence.length;
        //if (beatsToNext < 0) {
        //    beatsToNext += sequence.length;
        //}

        //look for the following chord to set the timeout
        let nextNextIndex = this.findNextChord(sequence, nextIndex);
        let nextDuration = nextNextIndex - nextIndex;
        nextDuration %= sequence.length;
        //if (nextDuration < 0) {
        //    nextDuration += sequence.length;
        //}

        //calculate the fade-in and timeout and update the diagram with them
        let fadeIn = beatsToNext*this.countsPerBeat*this.tempoMil;
        let duration = nextDuration*this.countsPerBeat*this.tempoMil;
        diagram.update(nextChord, fadeIn, duration);
        
        //increment counter
        this.counter++;

        let clear = document.querySelectorAll('.current-chord-gui');
        //console.log(clear.classList);
        for (let obj of clear) {
            obj.classList.remove('current-chord-gui');
        }
        this.matchGUItoChord(beat);
        /*
        //highlight the current chord in the GUI
        if (typeof this.nextGUIel != 'undefined') {
            d3.selectAll('.current-chord-gui').classed('current-chord-gui', false);
            this.nextGUIel.classed('current-chord-gui', true); 
        }
        //queue the GUI element that matches the next chord
        this.nextGUIel = d3.select(`#section-${song.structure[this.sectionIndex]}`)
            .select(`#chord-${this.beatIndex}`);
        
        //advance component from next to current
        this.prevComponent = currentGUIel;
        */
    },//end of repeat function

    //!!should be deprecated now
    //scan ahead in the chord sequence for the next chord change
    findNextChord(sequence, beat) {
        for (let i = 1; i < sequence.length; i++) {
            //check each beat until a chord is found
            nextIndex = i + beat;
            //!!add branching for repeat vs. single play
            //!!^ shouldn't be necessary now
            nextIndex%=sequence.length
            //once the chord is found, break out of the loop
            if (sequence[nextIndex]) {
                return nextIndex;
            }
        }
    },

    matchGUItoChordAlt() {
        for (let obj of document.querySelectorAll('.current-chord-gui')) {
            obj.classList.remove('current-chord-gui');
        }
        let chord = document.querySelector(`#section-${this.currentPos.sectionName}`)
            .querySelectorAll(`.gui-line`)[this.currentPos.lineIndex]
            .querySelectorAll(`.gui-measure`)[this.currentPos.measureIndex]
            .querySelectorAll(`.gui-beat`)[this.currentPos.beatIndex]
            .querySelectorAll('.gui-chord')[0];
        if (chord) {
            chord.classList.add('current-chord-gui');
        }
    },

    matchGUItoChord(beat) {
        //let beatIndex = 0;
        //let lineIndex = 0;
        //let sectionIndex = 0;
        if (beat < 0) {return;}
        //for (let i = 0; i < beat; i++) {
            //console.log(song.components[song.singleStruct[this.sectionIndex]][this.lineIndex])
            if (this.beatIndex >= document.querySelector('#section-' + song.singleStruct[this.sectionIndex])
                    .childNodes[this.lineIndex]
                    .querySelectorAll('.gui-chord').length) {
                this.beatIndex = 0;
                this.lineIndex++;
                if (this.lineIndex >= song.components[song.singleStruct[this.sectionIndex]].length) {
                    this.lineIndex = 0;
                    this.sectionIndex++;
                    //add branching for repeat/single play modes
                    if (this.sectionIndex >= song.singleStruct.length) {
                        this.sectionIndex = 0;
                    }
                }
            }
        //}
        //not sure I need this
        //this.prevComponent = this.currentGUIel;
        //!!make a separate function for looping through the GUI elements
        //  to be reused to convert GUI to text
        this.currentGUIel =
            document.querySelector('#section-' + song.singleStruct[this.sectionIndex])
                .childNodes[this.lineIndex]
                .querySelectorAll('.gui-chord')[this.beatIndex];
        
        this.currentGUIel.classList.add('current-chord-gui');
        //console.log(document.querySelector('#section-' + song.singleStruct[this.sectionIndex]).childNodes[this.lineIndex]
        //    .querySelectorAll('.gui-chord')[this.beatIndex]);

        this.beatIndex++;
    },
    
    //display the count in a textbox; play sound on downbeats
    //!!move metronome sound to update function, or make it its own?
    marquis: function() {
        //number of counts so far this measure
        let count = this.counter % (song.meter.beatsPerMeasure*this.countsPerBeat);
        //number of counts so far this beat
        let subCount = count % this.countsPerBeat;
        //text to append to the marquis textbox
        let marquis;

        //if this is the first downbeat of a measure
        if (count == 0 || this.counter == this.countIn) {
            marquis = '1';
            audio.percussion(false, false, false, true, true);
            //clear the marquis
            //document.getElementById('counter').value = '';
        //if this is a downbeat in the count-in
        } else if (this.counter < 0 && Math.abs(subCount) == 0) {
            marquis = 1 - (this.countIn/this.countsPerBeat + Math.abs(count)/this.countsPerBeat);
            audio.percussion(false, false, false, true);
        //if this is any other downbeat
        } else if (subCount == 0) {
            marquis = (count/this.countsPerBeat+1);
            audio.percussion(false, false, false, true);
        //if this is an upbeat (e.g. an 8th note in common time)
        } else if (subCount % 2 == 0 && song.meter.beatUnits !=8 && ! this.swing) {
            marquis = '&';
        //if this is a sixteenth note or a tripled 8th note
        } else {
            marquis = '.'
        }

        //append the text to the marquis textbox
        //document.getElementById('counter').value += marquis;
    },//end of marquis function

    paused: true,
    //the actual reference to the interval object
    //!!separate pause and stop
    beat: undefined,
    playPause: function() {
        if (this.paused) {
            this.paused = false;
            // playBtn.value = '\u{25AE}\u{25AE}';
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
            //set timer, and convert bpm to milliseconds:
            this.reset(true);
            this.beat = setInterval(this.altStep.bind(this), this.tempoMil);
        } else {
            this.paused = true;

            pauseBtn.style.display = 'none';
            playBtn.style.display = 'inline-block';

            audio.stop();
            // playBtn.value = '\u{25B6}';
            //this doesn't stop animations that have already started...
            clearInterval(this.beat);
            //this does
            //select all noteSets
            d3.selectAll('.note-set')
                //cancel current and pending animations
                .interrupt()
                //make semitransparent notes disappear
                //!replace this with a remove() function?
                .style('opacity', function() {
                    if (d3.select(this).style('opacity') < 1) {
                        return 0;
                    }
                });
        }
    },//end of playPause function
    stop: function() {
        this.paused = true;
        this.reset(true);

        pauseBtn.style.display = 'none';
        playBtn.style.display = 'inline-block';

        audio.stop();
        clearInterval(this.beat);
        d3.selectAll('.note-set').remove();
    },
}//end of timer definition
/*
//function to make outgoing notes flash
//!move this into the timer function eventually
let flashCounter = 0;
let flash = function() {
    flashCounter++;
    switch (flashCounter) {
        //case 4:
        //    flashCounter = 0;
        //    break;
        case 1: d3.selectAll('.flashing')
            .style('visibility', 'hidden');
            break;
        case 2: d3.selectAll('.flashing')
            .style('visibility', 'visible'); 
            flashCounter = 0;
            break;
    }
}
//let flasher = setInterval(flash, 100);
*/

//add event listener to play/pause buttons
let playBtn = document.getElementById('play');
playBtn.addEventListener('click', timer.playPause.bind(timer));
let pauseBtn = document.getElementById('pause');
pauseBtn.addEventListener('click', timer.playPause.bind(timer));

//FILE HANDLING------------------------------------------------------------------------------------------

// let contents = `(Summertime,Am,60,4/4,swing)
// ;A,B,C;
// :A,B:
// A[Am7|Bbm7|Bm7.BM7.|Cm7.CM7.|
// C#m7|Dm7|D#m7.D#M7.|E7|
// Fm7|F#7|G7|G#7|
// CM7.Am7.|D7.E7.|]
// B[Am7.D7.|Bm7.E7.|]
// C[Am7||]`;

// let song = new Song(contents);

// document.getElementById('text-editor').value = contents;

//file handling
//!!reintroduce automatically uploading the example file on page load
function loadFile(local, e=null) {
    let file;
    if (local) {
        file = e.target.files[0];
        if (file) { readFile(file); }
    } else {
        //promises are weird...
        file = fetch('./test.music').then(function(response) {
            response.blob().then(function(blob) {
                readFile(blob);
            })});
    }
}
function readFile (file) {
    let reader = new FileReader();
    reader.onload = function(e) {
        let contents = e.target.result;
        //display the file contents in the text box
        document.getElementById('text-editor').value = contents;
        //parse song data from file
        song = new Song(contents);
        editorGUI.setup();
        editorGUI.GUIfromSong();
    }
    reader.readAsText(file);
}

loadFile(false);
//bypass the default file upload control
let uploadButton = document.querySelector('#upload');
uploadButton.addEventListener('change', loadFile.bind(null, true), false);
let uploadDiv = document.querySelector('#upload-label');
uploadDiv.addEventListener('click', function() {uploadButton.click(); })

function download(text, filename) {
    var file = new Blob([text], {type: 'text/plain'});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        //garbage collection
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

let downloadDiv = document.querySelector('#download');
downloadDiv.addEventListener('click', function() {download(document.getElementById('text-editor').value, song.title + '.music'); });

let editorGUI = {
    dragBoxes: [],
    //do this on startup
    setup: function() {
        //chord menu
        this.dragBoxes.push(new Sortable(document.querySelector('#chord-menu'), {
            group: {
                name: 'editor',
                pull: 'clone',
                put: function(to, from, dragged) {
                    //can't put spacers in the chord menu
                    if (dragged.innerHTML == '') {return false;}
                    //cycle through the chords listed in the chord menu
                    for (let i = 0; i < to.el.children.length; i++) {
                        if (to.el.children[i].innerHTML == dragged.innerHTML) {
                            return false;
                        }
                    }
                    return true;
                },
                revertClone: true
            },
            scroll: true,
            sort:true,
        }));
        //spacer menu
        // this.dragBoxes.push(new Sortable(document.querySelector('#spacer-menu'), {
        //     group: {
        //         name: 'editor',
        //         pull: 'clone',
        //         put: false,
        //         revertClone: true
        //     },
        //     scroll: false,
        // }));
        //trash
        this.dragBoxes.push(new Sortable(document.querySelector('#trash'), {
            group: {
                name: 'editor',
                pull: false,
                put: true
            },
            onAdd: function(evt) {
                evt.item.parentNode.removeChild(evt.item);
            },
            scroll: false,
        }));
        //options common to all of the above
        for (let e of this.dragBoxes) {
            e.option('animation', 500);
            e.option('ghostClass', 'sort-ghost');
            e.option('chosenClass', 'sort-select');
            e.option('dragClass', 'sort-drag');
        }
    },//end of setup function

    //do this after loading song data
    GUIfromSong: function() {
        //d3: clear out any previous GUI elements
        d3.selectAll('.section').remove();
        d3.selectAll('.section-selector').remove();
        d3.selectAll('.gui-chord').remove();

        //slightly recycled code
        ['title','key','tempo'].forEach(function(e) {
            document.querySelector(`#${e}`).value = song[e];
        });
        document.querySelector('#meter').value = song.meter.beatsPerMeasure + '/' + song.meter.beatUnits;
        document.querySelector('#pattern').value = song.singleStruct.join(',');
        document.querySelector('#repeat-pattern').value = song.repeatStruct.join(',');
        
        //add chords in library to chord menu
        let chordMenu = d3.select('#chord-menu')
        for (let chord in song.chordLibrary) {
            chordMenu.append('span')
                .attr('class', 'gui-chord')
                .html(textToSymbol(chord));
        }

        //add tabs and tab content for each section
        for (let section of Object.keys(song.components).sort()) {
            
            //tab selector button
            d3.select('#section-selectors').append('input')
                .attr('type', 'button')
                .attr('id', 'section-selector-' + section)
                .attr('class', 'section-selector')
                .attr('value', section)
                //!!add (right-click || touch-and-hold) event to edit
                .attr('onclick', `tabChange(event, 'section-${section}')`);
            d3.select('#section-selectors').append('div')
                .attr('class', 'section-selector')
                //magic number .5rem = $grid-gap
                .style('width', '.5rem');
            
            //tab content
            let sectionDiv = d3.select('#section-wrapper').append('div')
                .attr('id', 'section-' + section)
                .attr('class', 'section')
            //loop through lines in section
            console.log(section);
            console.log(song.components[section]);
            song.components[section].forEach(function(line) {
                //add a sortable div for each line in the section
                let lineBox = sectionDiv.append('div')
                    .attr('class', 'gui-line')
                //loop through measures in line
                line.forEach(function(measure) {
                    //check to see whether there are multiple components;
                    //  true if multiple, false if only one
                    let measureBox = lineBox.append('span')
                        .attr('class', 'gui-measure')
                    //create chords and spacers
                    for (let i = 0; i < song.meter.beatsPerMeasure; i++) {
                        let beatBox = measureBox.append('span')
                            .attr('class', 'gui-beat')
                        //beatBox.append('div')
                        //    .attr('class', 'gui-spacer');
                        let chord = measure[i];
                        if (chord) {
                            beatBox.append('span')
                                .attr('class', 'gui-chord')
                                .html(textToSymbol(chord));
                        }
                    }
                    // measure.forEach(function(beat, index) {
                    //     if (beat) {
                    //         measureBox.append('span')
                    //             .attr('class', 'gui-chord')
                    //             .html(textToSymbol(beat));
                    //     }
                    // })
                });//end of measure loop
            });//end of line loop
        };//end of section loop

        //select the line divs, make their components draggable
        for (let e of document.querySelectorAll('.gui-beat')) {
            this.dragBoxes.push(new Sortable(e, {
                group: 'editor',
                animation: 500,
                draggable: '.gui-chord',

                ghostClass: 'sort-ghost',
                chosenClass: 'sort-select',
                dragClass: 'sort-drag',
                scroll: true,
            }));
        }
        //select the first section as if the button had been clicked
        document.querySelector('#section-selector-' + Object.keys(song.components).sort()[0]).click();
    }//end of GUIfromSong function
}//end of editorGUI declaration

//make the buttons bring up the tab content for each section
function tabChange(evt, tabID) {
    let tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("section");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab");
    d3.selectAll('.section-selector').classed('active', false);
    
    document.getElementById(tabID).style.display = "block";
    evt.currentTarget.className += " active";
}

//initialize drag-drop interface
editorGUI.setup();
//!!placeholder until this becomes part of song loading procedure
//editorGUI.GUIfromSong();

//show/hide gui vs text editor
//!!may not be any point in hiding either if the screen is big
function editorToggle(GUIselect) {
    let GUIwrap = document.querySelector('#gui-wrapper');
    let textWrap = document.querySelector('#text-wrapper');
    let selected = GUIselect ? GUIwrap : textWrap;
    let other = GUIselect ? textWrap : GUIwrap;
    if (selected.className=='active-editor') {
        selected.className='inactive-editor';
        other.className='active-editor';
    } else {
        selected.className='active-editor';
        if (window.innerWidth < 800) {
            other.className='inactive-editor';
        }
    }
}
//anonymous functions needed to prevent these being read as IIFEs
// document.querySelector('#toggle-gui').addEventListener('click', function(){editorToggle(true)});
// document.querySelector('#toggle-text').addEventListener('click', function(){editorToggle(false)});


//convert GUI elements to text
function GUItoText() {
    //!!add validation

    //convert GUI elements to text
    //header
    let text = '(' + ['title','key','tempo','meter'].map(e => document.querySelector(`#${e}`).value).join(',') + ')\n';
    //patterns
    text += ';' + document.querySelector('#pattern').value + ';\n';
    let repeat = document.querySelector('#repeat-pattern').value;
    if (repeat) { text += ':' + repeat + ':\n'; }
    //sections
    let sections = document.querySelectorAll('.section');
    for (let section of sections) {
        //start each section with a line break,
        //  the name of the section, and an opening bracket
        //magic number 8 = the length of 'section-',
        //  the irrelevant part of the id name
        text += section.id.slice(8) + '[';
        let lines = section.childNodes;
        for (i = 0; i < lines.length; i++) {
            let line = lines[i];
            //no line break for the first line
            if (i != 0) { text += '\n'; }
            let components = line.childNodes;
            for (let component of components) {
                //get the component info from the class name
                let className = component.className;
                text+= (function() {
                    switch (className) {
                        case 'gui-chord':
                            //this contains the name of the chord
                            return textToSymbol(component.innerHTML, true);
                        case 'spacer-dot':
                            return '.';
                        case 'spacer-bar':
                            return '|';
                    }//end of switch block
                })();
            }//end of component loop
        }//end of line loop
        text += ']';
    }//end of section loop
    document.querySelector('#text-editor').value = text;
    song = new Song(text);
    timer.reset(true);
}//end of GUItoText function

document.querySelector('#gui-to-text').addEventListener('click', GUItoText);
document.querySelector('#text-to-gui').addEventListener('click', function() {
        song = new Song(document.querySelector('#text-editor').value);
        editorGUI.GUIfromSong();    
    });


//!!make this generalizable to other replacement functions!
function textToSymbol(str, reversed = false) {
    //add a setting to turn this off and use plain text
    let pairs = [
        ['uni', '1'],
        ['dim', '\u{00b0}'],
        ['m7b5', '\u{1d1a9}'],
        ['M', '\u{0394}'],
        ['m', '-'],
        ['b', '\u{266d}'],
        ['#', '\u{266f}']
    ]
    pairs.forEach(function(e) {
        if (reversed) {
            str = str.replace(e[1], e[0]);
        } else {
            str = str.replace(e[0], e[1]);
        }
    })
    return str;
}

// WEB AUDIO API-----------------------------------------
//!!oscillator generation functions could certainly be more DRY... create a recyclable function for that, maybe using a closure to remember the previous oscillators created with it?
let audio = {
    context: undefined,
    bass: undefined,
    treble: [],
    //cymbals and/or other percussion
    gain: {
        perc: undefined,
        bass: undefined,
        treble: undefined,
        master: undefined,
    },
    gainDefaults: {
        perc: 1,
        bass: .25,
        treble: .15,
        master: .35,
    },
    get now() {
        return this.context.currentTime;
    },

    //inital context creation
    setup: function() {
        this.context = new AudioContext();
        this.gain.master = this.context.createGain();

        for (let key in this.gain) {
            if (key=='master') {
                this.gain[key].connect(this.context.destination);
            } else {
                this.gain[key] = this.context.createGain();
                this.gain[key].connect(this.gain.master);
            }
            this.gain[key].gain.value = this.gainDefaults[key];
        }
    },

    //play notes (does not play percussion)
    play: function(chord) {
        //stop all previous notes
        this.stop.call(this);
        this.treble = [];
        let root = encodeNote(chord.root);
        //assign root to bass
        this.bass = this.context.createOscillator();
        this.bass.frequency.value = this.frequency(root, 2);
        this.bass.type = 'sawtooth';
        this.bass.connect(this.gain.bass);
        this.bass.start();
        //convert chord intervals into absolute notes
        let treble = chord.guides.concat(chord.auxExp).map(function(el) {
            return (encodeInterval(el) + root)%12;
        });
        // create array of oscillators to play treble
        // connect all new oscillators to respective gains
        // start oscillators
        this.treble = treble.map(function(el) {
            let osc = audio.context.createOscillator();
            osc.frequency.value = audio.frequency(el, 3);
            // osc.type = 'sawtooth';
            osc.connect(audio.gain.treble);
            osc.start();
            return osc;
        });
    },

    //stop all notes (doesn't work on percussion)
    stop: function() {
        if (this.bass) {
            this.bass.stop();
            for (let i of this.treble) {
                i.stop();
            }
        }
    },

    //obtain frequency in Hz from encoded (numbered) note
    frequency: function(note, octave) {
        //since my scale starts at A, but standard octave numbering starts at C
        if (note%12 > 2) { octave-=1; }
        //formula for converting standard MIDI numbers (where C4==60 and each semitone==1) to absolute frequency:
        //  f = Math.pow(2,(m-69)/12*440)
        return Math.pow(2,note/12+octave-4)*440;
    },

    percussion: function(snare = false, cymbal = false, open = false, metronome = false, metronome1 = false) {
        let now = this.now;
        let context = this.context;
        let envelope = context.createGain();

        //!!non-integer harmonics, except for metronome (change this?)
        let ratios = metronome1? [100] : metronome ? [50] : [2,3,4.16,5.43,6.79,8.21];
        let fundamental = snare || cymbal ? 40 : 20; //not synthesized, just used for calculations
        //make a way to cut off open cymbal sounds
        let duration = now + (cymbal ? open ? 10 : .3 : snare? .2 : .5);
        let dropoff = now + .2;

        if (snare) {
            //generate random noise for snare
            //buffer = array; memory storage of tiny sound clips
            let snareBuffer = context.createBufferSource();
            snareBuffer.buffer = (function() {
                //sample rate = the number of sound samples the system can handle per second; this uses the maximum to generate 1 second of random audio (white noise; equal volume at all frequencies)
                let bufferSize = context.sampleRate;
                let buffer = context.createBuffer(1, bufferSize, bufferSize);
                let output = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 -1;
                }
                return buffer;
            }())

            let snareFilter = context.createBiquadFilter();
            snareFilter.type = 'highpass';
            snareFilter.frequency.value = 1000;
            snareBuffer.connect(snareFilter);

            let snareEnvelope = context.createGain();
            snareFilter.connect(snareEnvelope);
            snareEnvelope.connect(this.gain.perc);
            //end of snare creation

            snareEnvelope.gain.value = 1;
            snareEnvelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
            snareBuffer.start();
            snareBuffer.stop(now + .2);
        }//end of snare portion

        if (cymbal) {
            //bandpass: frequencies outside the given range are attenuated
            //don't want this block scoped... this seems messy though
            var bandpass = context.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.frequency.value = 10000;
    
            //highpass: frequencies below the given frequency are attenuated
            let highpass = context.createBiquadFilter();
            highpass.type = 'highpass';
            highpass.frequency.value = 7000;
    
            //connect graph
            bandpass.connect(highpass);
            highpass.connect(envelope);
        } //end of cymbal portion

        //generate range of frequencies
        ratios.forEach(function(ratio) {
            let osc = context.createOscillator();            
            osc.frequency.value = fundamental * ratio;

            if (cymbal) {
                osc.type = 'square';
                osc.connect(bandpass);
            } else {
                osc.type = metronome ? 'sawtooth' : 'triangle';
                osc.frequency.exponentialRampToValueAtTime(0.0001, dropoff)

                osc.connect(envelope);
            }
            osc.start(now);
            osc.stop(duration);
        });//end of frequency generation

        //volume envelope
        envelope.connect(audio.gain.perc);
        //!!5 seems excessive, but otherwise the kick drum is too quiet!
        envelope.gain.value = metronome ? .5 : cymbal || snare ? 1 : 5;
        envelope.gain.exponentialRampToValueAtTime(0.0001, duration);   
    }//end of percussion function
}
audio.setup();

//DEPRECATED BUT USEFUL FOR REFERENCE----------------------------------
/*
let button = document.getElementById('button');
button.addEventListener('click', update);
input.addEventListener('keyup', function(e) {
    //keyCode 13 == 'enter' key
    //works better than form submission for some reason
    if (e.keyCode===13) {
        button.click();
    }});
*/