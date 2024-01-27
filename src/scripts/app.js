import sounds from '../../data/sounds.json';

import WaveSurfer from 'wavesurfer.js'

import Cookies from 'js-cookie'

console.log(sounds);


String.prototype.toDuration = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return minutes + ':' + seconds;
}

/**
 * Color Scheme
 */
{
    let theme = Cookies.get('theme')

    if (theme && ['dark', 'light'].includes(theme)) {
        document.documentElement.dataset.theme = theme;
    }

    document.querySelector('.theme-toggle').addEventListener('click', (button) => {
        let oldTheme = document.documentElement.dataset.theme;

        let newTheme;
        if (oldTheme == 'dark') {
            newTheme = 'light'
        } else {
            newTheme = 'dark';
        }

        document.documentElement.dataset.theme = newTheme;
        Cookies.set('theme', newTheme)
    });
}


/**
 * Observer Hero
 */
{
    const intersectionObserver = new IntersectionObserver((entries) => {
        console.log(entries[0]);

        if (entries[0].isIntersecting) {
            document.querySelector("#header").classList.remove('stuck');
            document.querySelector("#header").dataset.theme = '';
        } else {
            document.querySelector("#header").classList.add('stuck');
            document.querySelector("#header").dataset.theme = 'dark';
        }

    });

    intersectionObserver.observe(document.querySelector(".hero .title"));
}

/**
 * Make domain as a filename type toggle
 */
{
    function makeDomainAsFileNameToggle() {
        const typeToggle = document.querySelector('.domain');
        const currentType = Cookies.get('filename_type') || 'vip';

        function setType(type) {
            typeToggle.dataset.text = typeToggle.dataset[type];
        }

        setType(currentType);

        typeToggle.addEventListener('click', (e) => {
            let wavText = typeToggle.getAttribute('data-wav');
            let text = typeToggle.getAttribute('data-text');

            let toType = text == wavText ? 'vip' : 'wav';

            setType(toType)

            Cookies.set('filename_type', toType)
        })
    }

}

function geteFileNameByPath(file, ext = 'wav') {
    return file.split('\\').pop().split('/').pop().replace('.' + ext, '')
}

function getAudioPath(name) {
    return 'sounds/' + name + '.wav';
}

/**
 * Audio
 */
function downloadAudio(file, name = '') {
    var a = document.createElement('a');
    // var url = window.URL.createObjectURL(blob);

    if (!name)
        name = geteFileNameByPath(file)

    a.href = file;
    let filenameType = Cookies.get('filename_type') || 'vip';
    if (filenameType == 'vip') {
        a.download = '(特派𝕏锁铃) ' + name + ' [LockChime.VIP]' + '.wav';
    } else {
        a.download = 'LockChime.wav';
    }

    a.click();
    // window.URL.revokeObjectURL(url);
}

{
    let currentAudio = null;

    sounds.forEach(sound => {
        const template = document.querySelector('#sound-item');
        const clone = template.content.cloneNode(true);
        const item = clone.querySelector('.sound-item');
        const player = item.querySelector('.player');
        const wavFilePath = 'sounds/' + sound.name + '.wav';

        // Set name
        item.querySelector('.name').innerHTML = sound.name;
        item.querySelector('.size').innerHTML = sound.size + 'KB';

        let date = new Date(0);
        date.setSeconds(sound.duration)
        let duration = date.toISOString().substring(14, 19);
        item.querySelector('.total-time').innerHTML = duration;
        item.querySelector('.current-time').innerHTML = '00:00';

        // Set cover
        let cover = null;
        if ('cover' in sound) {
            cover = sound.cover;
        } else {
            cover = 'default';
        }
        let img = item.querySelector('img')
        img.src = 'sounds/' + cover + '.webp';
        img.alt = sound.name

        function createAudio() {
            let audio = document.createElement('audio');

            audio.src = wavFilePath;
            // audio.controls = true;

            audio.onplaying = function () {
                item.dataset.status = 'playing'
            }

            audio.onpause = function () {
                item.dataset.status = 'paused'
            }

            audio.onended = function () {
                item.dataset.status = 'ended'
            }

            audio.addEventListener('play', function () {
                if (currentAudio == audio) {
                    return;
                }

                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                }

                currentAudio = audio;
            }, 1000);

            // Circular Timeline
            let seekCircle = item.querySelector('.seek'),
                totalLength = seekCircle.getTotalLength();

            seekCircle.setAttribute('stroke-dasharray', totalLength)
            seekCircle.setAttribute('stroke-dashoffset', totalLength)

            audio.addEventListener('timeupdate', () => {
                // console.log('timeupdate', audio.currentTime)
                let currentTime = audio.currentTime;

                let maxduration = audio.duration;
                let progress = totalLength - (currentTime / maxduration * totalLength);

                seekCircle.setAttribute('stroke-dashoffset', progress);
            });

            // append to container
            player.appendChild(audio);

            return audio;
        }

        item.querySelector('.cover').addEventListener('click', (e) => {
            console.log('click cover')

            const audio = item.querySelector('audio') || createAudio();
            console.log(audio);

            item.dataset.status == 'playing' ? audio.pause() : audio.play();
        })

        item.querySelector('.download-button').addEventListener('click', (e) => {
            downloadAudio(wavFilePath, sound.name);
        })

        document.querySelector('.sound-loop').appendChild(clone)
    })
}

/**
 * Tags Toggle
 */
{
    document.querySelector('.tags-toggle').addEventListener('click', e => {
        document.querySelector('.filter').classList.toggle('tags-open')
    })

    document.querySelectorAll('.tags span').forEach((tag) => {
        tag.addEventListener('click', e => {
            document.querySelector('.filter').classList.remove('tags-open')
        })
    })
}


/**
 * Search
 */
{
    const searchForm = document.querySelector('.search-form');
    const searchInput = searchForm.querySelector('input');

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const searchTerm = searchInput.value.trim().toLowerCase();

        if (!searchTerm) {
            document.querySelector('.no-results').hidden = true;
            document.querySelectorAll('.sound-item').forEach((item, index) => {
                item.hidden = false;
            })
            return;
        }

        // sounds.filter((sound, index) => {
        //     sound.index = index;
        //     return sound.name.toLowerCase().includes(searchTerm) || ('tags' in sound && sound.tags.toLowerCase().includes(searchTerm))
        // })


        let hasResult = false;
        document.querySelectorAll('.sound-item').forEach((item, index) => {
            const sound = sounds[index];

            const match = sound.name.toLowerCase().includes(searchTerm) || ('tags' in sound && sound.tags.toLowerCase().includes(searchTerm));

            item.hidden = !match;

            if (!hasResult && match) {
                hasResult = true;
            }
        })

        document.querySelector('.no-results').hidden = hasResult;
    })

    document.querySelector('.search-form input').addEventListener('input', (e) => {
        searchForm.requestSubmit();
    });

    document.querySelectorAll('.tags span').forEach((item) => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            document.querySelector('.search-form input').value = item.innerText;

            searchForm.requestSubmit()
        })
    })

    document.querySelector('.clear-button').addEventListener('click', (e) => {
        searchInput.value = '';

        searchForm.requestSubmit()
    });
}


/**
 * Loop Layout
 */
{
    const loop = document.querySelector('.sound-loop');

    const currentLayout = Cookies.get('loop_layout') ?? 'grid';
    loop.dataset.layout = currentLayout;

    function switchLayout(currentLayout) {
        document.querySelectorAll('.layout-toggle').forEach(button => {
            button.hidden = currentLayout == button.dataset.layout;
        })
    }

    switchLayout(currentLayout);

    document.querySelectorAll('.layout-toggle').forEach(button => {
        button.addEventListener('click', (e) => {
            const layout = button.dataset.layout;

            loop.dataset.layout = layout;

            Cookies.set('loop_layout', layout)

            switchLayout(layout)
        })
    })

}

/**
 * Help Dialog
 */
{
    const helpContainer = document.querySelector('.help-container');

    document.querySelector('.help-toggle').addEventListener('click', () => {
        helpContainer.hidden = !helpContainer.hidden
    })

    document.querySelector('.help-container .close-button').addEventListener('click', () => {
        helpContainer.hidden = true
    })

    document.querySelector('.help-container').addEventListener('click', (e) => {
        if (!e.target.closest('.help')) {
            helpContainer.hidden = true
        }
    })

}


/**
 * About Dialog
 */
{
    const container = document.querySelector('.about-container');

    document.querySelector('.menu-toggle').addEventListener('click', () => {
        container.hidden = !container.hidden
    })

    document.querySelector('.about-container .close-button').addEventListener('click', () => {
        container.hidden = true
    })

    document.querySelector('.about-container').addEventListener('click', (e) => {
        if (!e.target.closest('.about')) {
            container.hidden = true
        }
    })

}




/**
 * No Source code
 */

// Disable right-click context menu
document.addEventListener('contextmenu', event => event.preventDefault());

// Disable F12 key and Ctrl+Shift+I combo
document.addEventListener('keydown', event => {
    if (event.keyCode === 123 || (event.ctrlKey && event.shiftKey && event.keyCode === 73)) {
        event.preventDefault();
    }
});

const defaultHeroAudio = sounds.find((sound) => sound.name == 'Cymatics');
let heroAudio = defaultHeroAudio;

let wavesurfer = WaveSurfer.create({
    container: '.waveform',
    waveColor: '#E31937',
    progressColor: '#24d42d',
    barWidth: 4,
    barGap: 3,
    barRadius: 2,
    height: 42,
    cursorWidth: 0,
    url: getAudioPath(heroAudio.name),
})

wavesurfer.on('click', () => {
    wavesurfer.setTime(0)
    wavesurfer.play()
})

wavesurfer.on('play', () => {
    document.querySelector('.hero').classList.add('is-playing');

    document.querySelector('.hero .intro h2').innerText = geteFileNameByPath(heroAudio.name)
})
wavesurfer.on('finish', () => {
    document.querySelector('.hero').classList.remove('is-playing');
})

document.querySelector('.hero .banner').addEventListener('click', () => {
    const random = Math.floor(Math.random() * sounds.length - 1);
    const sound = sounds[random]

    heroAudio = sound;

    wavesurfer.load(getAudioPath(sound.name)).then(() => {
        wavesurfer.play()
    })
})

document.querySelector('.hero .title').addEventListener('click', () => {
    heroAudio = defaultHeroAudio;

    wavesurfer.load(getAudioPath(heroAudio.name)).then(() => {
        wavesurfer.play()
    })
})

document.querySelector('.hero .intro').addEventListener('click', () => {
    downloadAudio(getAudioPath(heroAudio.name))
})