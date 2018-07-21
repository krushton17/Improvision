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

        //make an array of arrays that hold these,
        //  so normalization functions can iterate
        //  through all of them?
        //makeshift enum to facilitate that?
        //['uni'] because the root usually does not appear in the other arrays
        let notes = ['uni'].concat(guides, auxExp, auxImp);
        
        //sort notes by their numerical value;
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
            for (let fret = 0; fret <= instrument.fretNumber-1; fret++) {
                //at each fret, loop through the chord tones to see if they match
                for (let interval of this.notes) {
                    //note = absolute number value of the note played by that fret
                    //!use the normalize function?
                    let note = openNote + fret;
                    //keep note value between 0:11
                    while (note > 11) {
                        note-=12;
                    }
                    //convert interval name to number
                    let intNum = encodeInterval(interval);
                    //convert interval to absolute note by adding to the root
                    intNum += encodeNote(this.root);
                    //keep note value between 0:11
                    while (intNum > 11) {
                        intNum -= 12
                    }
                    //if this fret is part of the chord,
                    //  add the name of the interval to the set of scale degrees.
                    //  this way d3 can display the interval name; the actual note name is irrelevant rn.
                    if (intNum == note) {
                        notes[i].push({
                            'fret': fret,
                            'interval': interval,
                            //for use in the key function:
                            //'signature': fret + interval

                            //for bug testing
                            'signature': randomizer
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
        if (note > 11) {
            note -= 12;
        }
    });
}

//SONG CLASS DEF----------------------------------------------------------------------------------------------------------

class Song {
    //use this to check whether a component is a placeholder or a chord
    static get placeHolder() {return /[\n.\|]/;}

    constructor(text) {
        //!!add validation & errors
        let header = text.slice(text.indexOf('(')+1, text.indexOf(')')).split(',');
        this.title = header[0];
        this.key = header[1];
        this.tempo = header[2];
        this.timeSig = (function() {
            let timeSig = [];
            //numerator
            timeSig[0] = +header[3].match(/^\d+/)[0];
            //denominator
            timeSig[1] = +header[3].match(/\d+$/)[0];
            //swing boolean
            timeSig[2] = header[4] && header[4] == 'swing' ? true : false;
            return timeSig;
        })();
        this.structure = /;.*;/.exec(text)[0].slice(1,-1).split(',');
        this.structRepeat = /:.*:/.exec(text)[0].slice(1,-1).split(',');
        //sections: the general song structure/codas/repeating sections, etc.
        //!!for some reason, trying to match more than one letter with + or * produces an error...
        let sections = text.match(/\w\[[^\[\]]+\]/g);
        //create empty variables to store iteration results
        this.components = {};
        let chordLibKeys = new Set();
        this.lineBreaks = {};
        //iterate through sections, then through the chords, etc.
        for (let i = 0; i < sections.length; i++) {
            let label = sections[i].charAt(0);
            let components = sections[i].slice(1).match(/\.*\||\.+|\n|[^\|\[\]\n.]+/g);
            let chordSeq = [];
            let beatsLeft = this.timeSig[0];
            this.lineBreaks[label] = [];
            for (let j = 0; j < components.length; j++) {
                //if the | is preceded by .'s, calculate duration by counting the .'s
                //if the component is a line break, store the last chord's index
                //  so the editor knows where to put the line breaks
                //if (/\n/.test(components[j])) {
                    this.lineBreaks[label].push(chordSeq.length);
                //if the component contains a |
                //} else 
                if (/\|/.test(components[j])) {
                    //add the beats left in the measure to the chord duration
                    chordSeq[chordSeq.length-1]['duration'] += beatsLeft;
                    //reset the number of beats for the next measure
                    beatsLeft = this.timeSig[0]
                //if the component is a . or series of .'s (but does not contain a |)
                //!!more efficient way to evaluate this?    
                } else if (/\.+/.test(components[j])) {
                    //set the chord duration to the number of .'s
                    let beats = components[j].match(/\.+/)[0].length;
                    //in case there are more periods than should be allowed in a single measure
                    if (beats >= this.timeSig[0]) {
                        //act as though there were a | instead of .'s
                        chordSeq[chordSeq.length-1]['duration'] += beatsLeft;
                        beatsLeft = this.timeSig[0]
                    } else {
                        chordSeq[chordSeq.length-1]['duration'] += beats;
                        beatsLeft -= beats;
                        if (beatsLeft <=0) {
                            beatsLeft = this.timeSig[0];
                        }
                    }
                //otherwise, the segment is a chord name; push it to the end of the chord sequence
                //  the duration will be set on the next j pass
                } else  if (!/\n/.test(components[j])) {
                    //store the order and duration of the chords
                    chordSeq[j] = { chord: components[j], duration: 0 };
                    //queue the chord for later parsing
                    chordLibKeys.add(components[j]);
                }
            }//end of for loop for section components
            //transfer local variable to object property
            this.components[label] = components.map(function(e, i) {
                if (typeof chordSeq[i] != 'undefined') {return chordSeq[i];}
                return e;
            });
        }
        //parse each unique chord in the song and store in this set;
        //  diagram update will iterate through the song's components
        //  to obtain the right references to the data in this set
        this.chordLibrary = {};
        for (let i of chordLibKeys) {
            this.chordLibrary[i] = new Chord(i);
        }
    }//end of constructor
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

let timingCheck = false;

//add a destructor function to delete the diagram if you change instruments?
let diagram = {
    //reference numbers for overall diagram
    topMargin: 40,
    bottomMargin: 60,
    sideMargin: 30,
    //reference numbers for x axis
    fretWidth: 100,
    nutPos: 50,
    fretExt: 0, //how far the frets extend beyond the outermost strings
    get fretBoardWidth() {return this.fretWidth*instrument.fretNumber},
    //reference numbers for y axis
    stringSpacing: 40,
    get height() {return this.stringSpacing*(instrument.strings.length-1)},
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
            .range([this.topMargin + this.height, this.topMargin])
    },
    //set up the blank diagram
    setup: function() {
        //avoid a 'this' conflict when calling these later
        let xScale = this.xScale;
        let yScale = this.yScale;
        //set diagram height to hide scrollbar on fretboard
        d3.select('.diagram')
            .style('height', this.height + this.topMargin + this.bottomMargin)

        //create head
        let head = d3.select('.head')
            .attr('width', this.nutPos)
            .attr('height', this.height + this.topMargin + this.bottomMargin)
        //create groups for each string label
        let stringLabels = head.selectAll('g')
                .data(instrument.strings)
            .enter().append('g')
                //!magic number 18 == radius + stroke
                .attr("transform", function(d, i) { return `translate(18,${yScale(i)})`});
        //add string lines underneath note circles
        stringLabels.append('line')
                .attr('class', 'strings')
                .attr('x1', 0)
                .attr('x2', this.nutPos);
        //add line for nut
        head.append('line')
                .attr('class', 'fret')
                .attr('x1', this.nutPos-1.5)
                .attr('x2', this.nutPos-1.5)
                .attr('y1', yScale(0)+this.fretExt)
                .attr('y2', yScale(instrument.strings.length-1)-this.fretExt)
        //add note circles
        stringLabels.append('circle')
                .attr('class', 'note head')
                //.attr('r', 16)
                .attr('cx', 0);
        //add note names
        stringLabels.append('text')
                .attr('class', 'text')
                .attr('y', 5)
                .text(function(d) {return d;})
    
        //create fretboard
        d3.select('.fretContainer')
            //extra height allows for hidden scrollbar
            .style('height', this.height + this.topMargin + this.bottomMargin*2)
            .style('width', document.documentElement.clientWidth - this.nutPos)
            .style('overflow-x', 'scroll')
            .style('overflow-y', 'hidden')
        //store selection in variable
        let fretBoard = d3.select('.fretboard');
        //set fretBoard dimensions
        fretBoard.attr('width', this.fretBoardWidth)
            .attr('height', this.height + this.topMargin + this.bottomMargin)
            .attr('left', this.nutPos);
        //add color markers for key frets
        fretBoard
            .append('g')
                .attr('id', 'markers')    
                .selectAll('.marker')
                .data([3, 5, 7, 9, 12, 15, 17, 19, 21])
            .enter().append('rect')
                .attr('class', function(d) {
                    return d == 12 ? 'marker12' : 'marker';
                })
                .attr('x', function(d) { return xScale(d-1);})
                .attr('width', this.fretWidth + 3)
                .attr('y', this.topMargin)
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
                .attr('y1', yScale(0)+this.fretExt)
                .attr('y2', yScale(instrument.strings.length-1)-this.fretExt);
        //add fret labels at bottom
        fretBoard
            .append('g')
                .attr('id', 'fretLabels')
                .selectAll('text')
                .data(d3.range(1, instrument.fretNumber))
            .enter().append('text')
                //!change this to class: fret labels
                .attr('class', 'text')
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
                .attr('class', 'stringContainer')
                .attr("transform", function(d, i) { return `translate(0,${yScale(i)})`})
            .append('line')
                .attr('class', 'strings')
                .attr('x1', 0)
                .attr('x2', this.fretBoardWidth);
        //create empty groups for notes, and a variable to store them
        this.noteContainers = d3.selectAll('.stringContainer')
            .append('g')
            .attr('class', 'noteContainer');
        //resize fretboard whenever the window is resized
        window.addEventListener('resize', this.resize.bind(this));
        //set the initial size
        this.resize();
    },//end of diagram setup function

    update: function(nextChord, currentDur, nextDur) {
        //without this, it won't recognize this.xScale as a function
        let xScale = this.xScale;
        //signature == unique identifier for each note object
        let keyFunc = function(d) {
            return ++randomizer;;
        }
        //update notes for each string group
        this.noteContainers
            .data(instrument.strings)
            .each(function(d) {

                //select noteContainers
                let notes = d3.select(this).selectAll('g')
                    //switch to using the note data instead of string data
                    .data(nextChord.fretMap[d], keyFunc)

                //create new sub-container for each note
                let entering = notes.enter().append('g');
                
                //set attributes shared by circles and text
                entering
                    .attr("transform", function(d, i) { return `translate(${xScale(d.fret-.5)},0)`})
                    //fade in
                    .classed('next-chord', true)                    
                    //.style('opacity', 0)
                    .transition()
                        .on('start', function() {
                                //timingCheck = true;
                                //move to back;
                                //  keeps current chord's notes in front of next chord's notes
                                var firstChild = this.parentNode.firstChild; 
                                if (firstChild) { 
                                    this.parentNode.insertBefore(this, firstChild); 
                                } 
                            })
                    /*
                        //variables don't work as transition parameters!
                        //  must be passed through a function.
                        .duration(function() {
                                //for some reason nextDur works here, but not currentDur
                                //  I honestly have no idea why...
                                return currentDur;
                            })
                        .style('opacity', .5)
                        .on('end', function() {
                            d3.select(this)
                                .style('opacity', 1)
                                .classed('toRemove', true);
                        });
                    */

                //append circles
                entering.append('circle')
                    //set classes for formatting
                    .attr('class', function(d) {
                        let noteClass = 'note';
                        if (d.interval == 'uni') {
                            noteClass += ' root'; 
                        } else if (nextChord.guides.includes(d.interval)) {
                            noteClass += ' guides';
                        } else if (nextChord.auxExp.includes(d.interval)) {
                            noteClass += ' auxExp';
                        } else {
                            noteClass += ' auxImp';
                        }
                        return noteClass;
                    })
                //append text
                entering.append('text')
                        .attr('class', 'text')
                        .attr('y', 5)
                       //convert to most readable language
                        .text(function(d) {
                            switch(d.interval) {
                                case ('dim7'):
                                    return '\u{00B0}7';
                                case ('m3'):
                                case ('M3'):
                                    return '\u{0394}3';
                                case ('m7'):
                                case ('M7'):
                                    return '7';
                                case ('uni'):
                                    return '1';
                                default:
                                    return d.interval;
                            }
                        })
        })//end of 'each' block
    },//end of update function

    //keep the diagram smaller than the window
    resize: function() {
        //delay period minimizes resizing artifacts
        clearInterval(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
                //!magic number 10 == left margin of diagram tag
            d3.select('.fretContainer').style('width', document.documentElement.clientWidth - this.nutPos - this.sideMargin - 10 + 'px')
        }, 100);
    }//end of resize function
}//end of diagram class definition

//initialize diagram
diagram.setup();

//TIMING------------------------------------------------------------------------------------------------------------

let timer = {
    //find out how many counts per beat
    get countsPerBeat() {
        //if the time signature is in 8ths, 1 count per beat is enough
        //  otherwise 3 or 4, depending on whether swing == true
        return song.timeSig[1] == 8 ? 1 : song.timeSig[2] ? 3 : 4;
    },
    //convert tempo to milliseconds (factoring in counts per beat)
    get tempoMil() {
        return 60000/((+document.getElementById('tempo').value)*this.countsPerBeat);
    },
    //!!change this to MIDI so it syncs better, etc.
    get metronome() {
        return new Audio('click.mp3');
    },

    counter: 0,
    sectionIndex: 0,
    componentIndex: 0,
    currentComponent: {},
    nextGUIel: undefined,

    //reset everything to zero; for use by the stop button
    //!!create partial reset for pause
    reset: function() {
        this.counter = 0;
        this.sectionIndex = 0;
        this.componentIndex = 0;
        this.currentComponent = {};
        this.nextGUIel = undefined;
        //!!remove the note containers themselves instead?
        d3.selectAll('.noteContainer').selectAll('*').remove();
    },//end of reset function

    //increment the counter and update the diagram
    repeat: function() {
        //if the counter == 0 (only true here if the song is just starting)
        if (this.counter == 0) {
            //the first chord fades in with the count-in
            //'n.c.' doesn't do anything yet; just for future-proofing
            this.currentComponent['chord'] = 'Am7';
            this.currentComponent['duration'] = document.getElementById('count-in').value
        //if the counter >= than the number of counts per beat
        //  times the number of beats the current chord gets
        } else if (this.counter >= this.currentComponent.duration*this.countsPerBeat) {
            this.counter = 0;
        }
        
        //now this is true at the beginning of any new chord
        if (this.counter == 0) {
            //returns the section as an array of components
            let currentSection = song.components[song.structure[this.sectionIndex]];
            //returns the current component
            let nextComponent = currentSection[this.componentIndex];

            //skip non-chord components ([.\|\n])
            let timeout = 0;
            //!!may need to check if nextComponent is undefined as well
            while (typeof nextComponent.chord == 'undefined') {
                //move to the next chord in the section
                this.componentIndex ++;
                //if this is the end of the section
                if (this.componentIndex >= currentSection.length) {
                    //move to the next section
                    this.sectionIndex++;
                    //if this was the last section
                    if (this.sectionIndex >= song.structure.length) {
                        //go back to the first section
                        //!!add a procedure for ending the song
                        this.sectionIndex = 0;
                    }
                    //start at the first chord in the next section
                    this.componentIndex = 0;
                    //make sure to pull the component from the right section
                    currentSection = song.components[song.structure[this.sectionIndex]];
                }
                nextComponent = currentSection[this.componentIndex];
                //avoid infinite loop in case of an error
                timeout++;
                if (timeout > currentSection.length) {
                    alert('fuuuuuck');
                    break;
                }
            }//end of while loop

            //returns an actual chord object that can be passed to the diagram
            let currentChord = song.chordLibrary[this.currentComponent.chord];
            let nextChord = song.chordLibrary[nextComponent.chord];

            //calculate the fade-in duration based on the (next?) chord's duration in beats
            //  multiplied by the number of counts per beat,
            //  multiplied by the tempo in milliseconds per count
            let currentDur = this.currentComponent.duration*this.countsPerBeat*this.tempoMil;
            let nextDur = nextComponent.duration*this.countsPerBeat*this.tempoMil;
            
            //^ these values are definitely correct
            /*
            console.log('hullo');
            console.log(this.componentIndex, currentChord, fadeIn, nextChord, chordDur);
            */

            //remove the previous set of notes
            d3.selectAll('.toRemove').remove();
            //make the next chord fully opaque
            //  and queue it for removal next time around
            d3.selectAll('.next-chord')
                .classed('next-chord', false)
                .classed('toRemove', true);

            //update the diagram with the next chord
            //  currentDur never ends up being used but I'm keeping it just in case
            diagram.update(nextChord, currentDur, nextDur);
            
            //highlight the current chord in the GUI
            //!!hella glitchy--or is that just the diagram itself?
            if (typeof this.nextGUIel != 'undefined') {
                d3.selectAll('.current-chord-GUI').classed('current-chord-GUI', false);
                this.nextGUIel.classed('current-chord-GUI', true); 
            }
            //queue the GUI element that matches the next chord
            this.nextGUIel = d3.select(`#section-${song.structure[this.sectionIndex]}`)
                .select(`#chord-${this.componentIndex}`);

            //advance component from next to current
            this.currentComponent = nextComponent;
            //increment chord index
            this.componentIndex++;
        }
        this.timeMarquis();
        //increment counter
        this.counter ++;
        //console.log(`Repeat function took ${Date.now() - funcDur} ms.`)
    },//end of repeat function

    //display the count
    //!!change this to count measured, not chord durations
    //  right now this resets at the beginning of every chord
    count: '',
    timeMarquis: function() {
        if (this.counter == 0) {
            this.count = '1';
            this.metronome.play();
        } else {
            //if using swing beats
            if (song.timeSig[2] || song.timeSig[1] == 8) {
                //if the counter falls on a downbeat
                if (this.counter%3 == 0) {
                    this.count += this.counter/3+1;
                    this.metronome.play();
                //if the counter falls on an upbeat
                } else if ((this.counter+1)%3 == 0) {
                    this.count += ':';
                //counter falls on the first tripled 8th note
                } else {
                    this.count += '.';
                }
            //if not using swing beats
            } else {
                //if the counter falls on a downbeat
                if (this.counter%4 == 0) {
                    this.count += this.counter/4+1;
                    this.metronome.play();
                //if the counter falls on an upbeat
                } else if (this.counter%2 == 0) {
                    this.count += ':';
                //counter falls on a sixteenth note
                } else {
                    this.count += '.';
                }
            }
        }
        document.getElementById('timeMarquis').value = this.count;
    },//end of timeMarquis function

    paused: true,
    //the actual reference to the interval object
    //!!separate pause and stop
    beat: undefined,
    playPause: function() {
        if (this.paused) {
            this.paused = false;
            playBtn.value = 'pause';
            //set timer, and convert bpm to milliseconds:
            this.reset();
            this.beat = setInterval(this.repeat.bind(this), this.tempoMil);
        } else {
            this.paused = true;
            playBtn.value = 'play';
            //this doesn't stop animations that have already started...
            clearInterval(this.beat);
            //this does
            //select all g objects within the each noteContainer
            d3.selectAll('.noteContainer').selectAll('*')
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
    }//end of playPause function
}//end of timer definition

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

//add event listener to play/pause button
let playBtn = document.getElementById('play/pause');
playBtn.addEventListener('click', timer.playPause.bind(timer));

//FILE HANDLING------------------------------------------------------------------------------------------

let contents = `(Summertime,Am,60,4/4,swing)
;A,1,A,2;
:A,A1:
A[Am7|Bbm7|Bm7..BM7..|Cm7..CM7..|
C#m7|Dm7|D#m7..D#M7..|E7|
Fm7|F#7|G7|G#7|
CM7..Am7..|D7..E7..|]
B[Am7..D7..|Bm7..E7..|]
C[Am7||]`;

let song = new Song(contents);

document.getElementById('textEditor').value = contents;
/*
function localFile(e) {
    let file = e.target.files[0];
    if (!file) {
        return;
    }
    let reader = new FileReader();
    reader.onload = function(e) {
        let contents = e.target.result;
        //display the file contents in the text box
        document.getElementById('textEditor').value = contents;
        //parse song data from file
        song = new Song(contents);
        editorGUI.setup();
    }
    reader.readAsText(file);
}
//rearrange this
document.getElementById('file-load').addEventListener('change', localFile, false);
*/

/*
//durn div into sortable container
let sortable = new Sortable(document.querySelector('#sortable'), {
    group: 'editor',
    sort: true,
});
let sortable2 = new Sortable(document.querySelector('#sortable2'), {
    group: 'editor',
    sort: false,
});
*/

let editorGUI = {
    dragBoxes: [],
    setup: function() {
        //d3: instantiate GUI elements
        let chordMenu = d3.select('#chord-menu')
        for (let e in song.chordLibrary) {
            chordMenu.append('span')
                .attr('class', 'drag-chord')
                .html(e);
        }
        //add tabs and tab content for each section
        for (let e in song.components) {
            d3.select('.tab').append('input')
                .attr('type', 'button')
                .attr('class', 'tab')
                .attr('value', e)
                .attr('contentedidtable', 'true')
                .attr('onclick', `tabChange(event, 'section-${e}')`);
            let div = d3.select('#tab-wrapper').append('div')
                .attr('id', 'section-' + e)
                .attr('class', 'tab-content')
            
            let line;
            for (let i = 0; i < song.components[e].length; i++) {
                let comp = song.components[e][i];
                //create one drag-zone for each line in the section
                if (i == 0 || /\n/.test(comp)) {
                    line = div.append('div')
                        .attr('class', 'drag-zone')
                        .attr('id', `section-${e}-line-${i}`)
                }
                if (/[\|.]/.test(comp)) {
                    for (let j = 0; j < comp.length; j++) {
                        line.append('div')
                            .attr('class', function() {
                                switch (comp.charAt(j)) {
                                    case '.': return 'spacer-dot';
                                    case '|': return 'spacer-bar';
                                }
                            });
                    }
                //if the component is actually a chord
                //!!use typeof comp.chord != 'undefined' instead?
                } else if (!/\n/.test(comp)) {
                    line.append('div')
                        .attr('class', 'drag-chord')
                        .html(comp.chord)
                        .attr('id', `chord-${i}`)
                }
            }
        }
        //select the drag zones, make them draggable
        for (let e of document.querySelectorAll('.drag-zone')) {
            //!!editorGUI.drag....?
            this.dragBoxes.push(new Sortable(e, {
                group: 'editor',
                animation: 500,
                ghostClass: 'sort-ghost',
                chosenClass: 'sort-select',
                dragClass: 'sort-drag',
                scroll: true,
            }));
        }
        //the chord menu
        this.dragBoxes[0].option('group', {
            name: 'editor',
            pull: 'clone',
            put: function(to, from, dragged) {
                if (dragged.innerHTML == '') {return false;}
                //cycle through the chords listed in the chord menu
                for (let i = 0; i < to.el.children.length; i++) {
                    if (to.el.children[i].innerHTML == dragged.innerHTML) {
                        return false;
                    }
                }
                return true;
            },
        });
        //symbol menu
        this.dragBoxes[1].option('group', {
            name: 'editor',
            pull: 'clone',
            put: false,
            revertClone: true
        })
        this.dragBoxes[0].option('sort', true);
        this.dragBoxes[0].option('revertClone', true);
        this.dragBoxes.push(new Sortable(document.querySelector('#trash'), {
            group: 'editor',
            onAdd: function(evt) {
                evt.item.parentNode.removeChild(evt.item);
            }
        }))

    }//end of setup function
}//end of editorGUI declaration


function tabChange(evt, tabID) {
    let tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabID).style.display = "block";
    evt.currentTarget.className += " active";
}

editorGUI.setup();


//DEPRECATED INPUT STUFF--------------------------------------------------------------------------------

/*

//store reference to text box containing list of chords to cycle through
let input = document.getElementById('input');

//event handling for input
//!!make this a method or disburse functionality elsewhere?
let update = function(){
    //convert chord name to Chord object
    //!do something with this object so it's not destroyed
    let chordsArr = input.value.split(' ');
    for (let i of chordsArr) {
        timer.currentChords.push(new Chord(i));
    }
    //can't remember what this does, tbh...
    return false;
}//end of update function
update();

//add event listener to input sumbit button
let button = document.getElementById('button');
button.addEventListener('click', update);
input.addEventListener('keyup', function(e) {
    //keyCode 13 == 'enter' key
    //works better than form submission for some reason
    if (e.keyCode===13) {
        button.click();
    }});
*/