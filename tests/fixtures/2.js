$(document).ready(function () {
    ;('use strict')

    $('body').empty()
    $('head').empty()

    var agentInfo
    var myProgram
    var myVertical
    var currentTicketIndex = 0
    var doneCount = 0
    var doneSuccessful = 0
    var correctVerticalId
    var correctSkillId
    var phrasesNPC = [
        'test test'
    ]
    var cities = [
        'Ryazan',
        'Yakutsk',
        'Barnaul',
        'Ulan-Ude',
        'Krasnodar',
        'Arkhangelsk',
        'Yuzhno-Sakhalinsk',
        'Saint Petersburg',
        'Novorossiysk',
        'Tomsk',
        'Voronezh',
        'Astrakhan',
        'Kostroma',
        'Volgograd',
        'Novokuznetsk',
        'Makhachkala',
        'Vladivostok',
        'Tver',
        'Petropavlovsk-Kamchatsky',
        'Saratov',
        'Novosibirsk',
        'Moscow'
    ]

    // MEMORIZE

    function setCookieL(name, value, days) {
        var expires = ''
        if (days) {
            var date = new Date()
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
            expires = '; expires=' + date.toUTCString()
        }
        document.cookie = name + '=' + (value || '') + expires + '; path=/'
    }
    function getCookieL(name) {
        var nameEQ = name + '='
        var ca = document.cookie.split(';')
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i]
            while (c.charAt(0) == ' ') c = c.substring(1, c.length)
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length)
        }
        return null
    }

    var memoryIdentificator = 'ts_ad'

    if (!getCookieL(memoryIdentificator)) {
        fetch('https://adm.example.com/agent/permissions', {
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'x-source': 'helpdesk-frontend'
            },
            body: '{}',
            method: 'POST',
            credentials: 'include'
        })
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                const tempBody = {
                    log: {
                        id: 0,
                        agentId: data.result.id,
                        scriptName: GM_info.script.name,
                        scriptVersion: GM_info.script.version,
                        date: new Date().toISOString()
                    }
                }
                fetch('https://test.k.example.com/log/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8',
                        origin: 'https://adm.example.com'
                    },
                    body: JSON.stringify(tempBody)
                }).then((response) => {
                    response.ok ? setCookieL(memoryIdentificator, 'checked', 1) : false
                })
            })
    }

    var trainingTicketIds = [
        '1',
    ]

    var maxTickets = 20

    var platforms = ['Windows', 'Android', 'iOS']
    var mistakesLog = ''

    var timerChange
    var timerFade

    var startDate
    var endDate

    var ticksCount = 0
    var tick = 1000
    var ticksMaximum = 900000 // 900000
    var tickInterval


    /** ФУНКЦИИ **/

    function shuffleTickets(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1))
            ;[array[i], array[j]] = [array[j], array[i]]
        }
    }
    function getAgentPermissions() {
        var url = 'https://adm.example.com/permissions'

        var xhr = new XMLHttpRequest()
        xhr.open('POST', url)

        xhr.setRequestHeader('authority', 'adm.example.com')
        xhr.setRequestHeader('accept', 'application/json')
        xhr.setRequestHeader('accept-language', 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7')
        xhr.setRequestHeader('content-type', 'application/json')
        xhr.setRequestHeader('x-source', 'helpdesk-frontend')

        var data = '{}'

        xhr.send(data)
    }

    function getTicketData(ticketId) {
        generateUserInfo()
        var url = 'https://adm.example.com/ticket/admin_get'

        var xhr = new XMLHttpRequest()
        xhr.open('POST', url)

        xhr.setRequestHeader('authority', 'adm.example.com')
        xhr.setRequestHeader('accept', 'application/json')
        xhr.setRequestHeader('accept-language', 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7')
        xhr.setRequestHeader('content-type', 'application/json')
        xhr.setRequestHeader('x-source', 'helpdesk-frontend')

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                var data = JSON.parse(xhr.responseText)
                $('#ticketUserMessage').empty()
                $('#ticketUserMessage').append(
                    data.result.description.replace(/<a\b[^>]*>/gm, '').replace(/<\/a>/gm, '')
                )
                $('#ticketSubjectHeader').text(data.result.subject)
                // $('#ticketSubjectLeftside').text(data.result.subject)
                correctVerticalId = data.result.verticalId
                correctSkillId = data.result.skillId
                setTimeout(function () {
                    $('#ah-layer-blackout-popup').addClass('hide')
                }, 1250)
            }
        }

        var data = '{"ticketId":' + ticketId + '}'

        xhr.send(data)
    }

    function updateTalkingPhrase() {
        $('#talkNPC').html(phrasesNPC[Math.floor(Math.random() * phrasesNPC.length)])
        timerChange = setTimeout(updateTalkingPhrase, 15000)
    }

    function getRandomNumberBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    function generateUserInfo() {
        $('#generateTicketsNum').text(getRandomNumberBetween(1, 599))
        $('#generateIP').text(
            getRandomNumberBetween(10, 255) +
                '.' +
                getRandomNumberBetween(10, 255) +
                '.' +
                getRandomNumberBetween(10, 255) +
                '.' +
                getRandomNumberBetween(10, 255)
        )
        $('#generateWallet').text(getRandomNumberBetween(0, 163999) + ' руб.')
        $('#generateItems').text(getRandomNumberBetween(0, 9999) + ' items')
        $('#generateID').text(getRandomNumberBetween(100000, 99999999))
        $('#generateRegisterDate').text(
            'Reg: ' +
                getRandomNumberBetween(1, 26) +
                '.0' +
                getRandomNumberBetween(1, 9) +
                '.' +
                getRandomNumberBetween(2007, 2021) +
                ', ' +
                getRandomNumberBetween(10, 23) +
                ':' +
                getRandomNumberBetween(10, 59) +
                ':' +
                getRandomNumberBetween(10, 59)
        )
        $('#generateCity').text(cities[getRandomNumberBetween(0, cities.length)])
        $('#generatePlatform').text(platforms[getRandomNumberBetween(0, platforms.length)])
    }

    function msToTime(duration, show_days) {
        var seconds = parseInt((duration / 1000) % 60)
        var minutes = parseInt((duration / (1000 * 60)) % 60)
        var hours = parseInt((duration / (1000 * 60 * 60)) % 24)
        var days = parseInt(duration / (1000 * 60 * 60 * 24))
        hours = hours < 10 ? '0' + hours : hours
        minutes = minutes < 10 ? '0' + minutes : minutes
        seconds = seconds < 10 ? '0' + seconds : seconds

        return show_days
            ? GetNumberWithPostfix(days, 'дн.') + ', ' + hours + ':' + minutes + ':' + seconds
            : hours + ':' + minutes + ':' + seconds
    }

    function activateTicker() {
        $('#timeLeft').text(msToTime(++ticksCount * tick))
        if (tick * ticksCount == ticksMaximum) {
            endDate = new Date()
            Notiflix.Report.failure(
                'Время вышло :(',
                'Ты не успел, но ты можешь посмотреть свои результаты',
                'Хорошо',
                function () {
                    Notiflix.Block.pulse('body', 'Подсчитываем результаты...')
                    $('#diffTime').text(msToTime(endDate - startDate))
                    $('#ticketTrainerShow').addClass('hide')
                    $('#finishNum').text(doneCount)
                    $('#finishNumSuccessful').text(doneSuccessful)
                    if ((doneSuccessful / doneCount) * 100 > 90) {
                        $('#finishNumSuccessfulPercent').text(
                            ((doneSuccessful / doneCount) * 100).toFixed(2) + '% 🔥🔥🔥'
                        )
                        $('#finishNumSuccessfulPercent').css('color', '#06732a')
                    } else {
                        doneSuccessful / doneCount != NaN
                            ? $('#finishNumSuccessfulPercent').text('0% 😔')
                            : $('#finishNumSuccessfulPercent').text(
                                  ((doneSuccessful / doneCount) * 100).toFixed(2) + '% 😔'
                              )
                    }

                    if (mistakesLog != '') {
                        $('#results').after(`
                    <span id="mistakesLogLabel" class="card-title" style="padding-top: 10px; font-size: 22px;">Ошибки </span> <p id="mistakesLog"></p>
                    `)
                        $('#mistakesLog').html(
                            '<style>.material-tooltip { width: 600px; font-size: 13px; }</style>' +
                                mistakesLog
                        )
                        M.AutoInit()
                    }
                    $('#catNPC').addClass('hide')
                    setTimeout(function () {
                        $('#ticketFinishShow').removeClass('hide')
                    }, 1900)
                    fetch('https://mt.example.com/hooks/g8zb1yq6htb47nnb3g3q4kaoiw', {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            text: `Агент ${agentInfo} - [${myProgram}, ${myVertical}] - прошел тренажер за ${msToTime(
                                endDate - startDate
                            )}, результат: ${doneSuccessful}/${doneCount} (${(
                                (doneSuccessful / doneCount) *
                                100
                            ).toFixed(2)} %)`
                        })
                    }).then(() => Notiflix.Block.remove('body', 2000))
                    $('#timeLeft').text(msToTime((ticksCount = 0 * tick)))
                }
            )
            clearInterval(tickInterval)
        }
    }

    window.onload = function () {
        shuffleTickets(trainingTicketIds)

        Notiflix.Block.hourglass('body', 'Проверяем доступ...')
        getAgentPermissions()

        M.AutoInit()

        document.getElementById('btnStartTraining').onclick = function () {
            if (
                $('#myVertical option:selected').text() != 'Выбери вертикаль' &&
                $('#myProgram option:selected').text() != 'Выбери программу'
            ) {
                myVertical = $('#myVertical option:selected').text()
                myProgram = $('#myProgram option:selected').text()
                $('#welcomeStyle').remove()
                $('.greetingsWindow').addClass('hide')
                // оставлю без async
                getTicketData(trainingTicketIds[currentTicketIndex++])
                $('#verticalId').val($('#myVertical').val())
                $('#skillId').val($('#myProgram').val())
                $('.closeDialogueNPC').on('click', function (e) {
                    e.preventDefault()
                    $('#NotiflixReportWrap').remove()
                    startDate = new Date()
                    tickInterval = setInterval(() => {
                        activateTicker()
                    }, tick)
                    $('.acquaintanceNPC').fadeOut(1000)
                    $('#ticketTrainerShow').removeClass('hide')
                    $('#catNPC').removeClass('hide')
                    updateTalkingPhrase()
                })

                document.getElementById('myProgramHelpdesk').innerText = $(
                    '#myProgram option:selected'
                ).text()
                document.getElementById('myVerticalHelpdesk').innerText = $(
                    '#myVertical option:selected'
                ).text()
            } else {
                Notiflix.Report.failure(
                    'Не торопись'
                )
            }

            return false
        }

        $('.setTicketSkill').on('click', function (e) {
            e.preventDefault()
            $('#skillId').val(this.closest('a[data-marker]').getAttribute('data-marker'))
            document.getElementById('myProgramHelpdesk').innerText =
                this.closest('a[name]').getAttribute('name')
            var instance = M.Modal.getInstance(showSkills)
            instance.close()
        })

        $('#finishCurrentTicket').on('click', function (e) {
            e.preventDefault()
            let correctSkillName
            let correctVerticalName
            if (minorVerticalTickets.includes(trainingTicketIds[currentTicketIndex - 1])) {
                if (
                    $('#myVertical option:selected').text() == 'Delivery' &&
                    $('#myProgram option:selected').text() == 'Delivery 1st'
                ) {
                    if ($('#skillId').val() == correctSkillId && $('#verticalId').val() == 3) {
                        $('#doneCount').text(++doneCount)
                        $('#doneSuccessful').text(++doneSuccessful)
                        $('#doneSuccessfulPercent').text(
                            ((doneSuccessful / doneCount) * 100).toFixed(2) + '%'
                        )
                    } else {
                        $('#doneCount').text(++doneCount)
                        $('#doneSuccessfulPercent').text(
                            ((doneSuccessful / doneCount) * 100).toFixed(2) + '%'
                        )
                        correctSkillName = $('a[data-marker="' + correctSkillId + '"]').text()
                        mistakesLog +=
                            '<b class="tooltipped" data-position="top" data-tooltip="' +
                            $('#ticketUserMessage').html().replace(/["']/g, '') +
                            '"><a href="https://adm.example.com/details/' +
                            trainingTicketIds[currentTicketIndex - 1] +
                            '" target="_blank">В тикете №' +
                            currentTicketIndex
                        mistakesLog +=
                            'Ты выбрал программу <b>' +
                            $('#myProgramHelpdesk').text() +
                            '</b>, при этом верная была <b>' +
                            correctSkillName +
                            '</b><br>'
                    }
                } else {
                    if ($('#skillId').val() == correctSkillId && $('#verticalId').val() != 8) {
                        $('#doneCount').text(++doneCount)
                        $('#doneSuccessful').text(++doneSuccessful)
                        $('#doneSuccessfulPercent').text(
                            ((doneSuccessful / doneCount) * 100).toFixed(2) + '%'
                        )
                    } else {
                        $('#doneCount').text(++doneCount)
                        $('#doneSuccessfulPercent').text(
                            ((doneSuccessful / doneCount) * 100).toFixed(2) + '%'
                        )
                        correctSkillName = $('a[data-marker="' + correctSkillId + '"]').text()
                        mistakesLog +=
                            '<b class="tooltipped" data-position="top" data-tooltip="' +
                            $('#ticketUserMessage').html().replace(/["']/g, '') +
                            '"><a href="https://adm.example.com/helpdesk/details/' +
                            trainingTicketIds[currentTicketIndex - 1] +
                            '" target="_blank">В тикете №' +
                            currentTicketIndex +
                            '</a></b>: вопрос был безвертикальным'
                        if ($('#verticalId').val() == 8) {
                            mistakesLog += ', но в вертикали DE пользователю не помогут. '
                        } else {
                            mistakesLog += ', поэтому вертикаль не учитывалась. '
                        }
                        mistakesLog +=
                            'Ты выбрал программу <b>' +
                            $('#myProgramHelpdesk').text() +
                            '</b>, при этом верная была <b>' +
                            correctSkillName +
                            '</b><br>'
                    }
                }
            } else {
                if (
                    $('#myProgram option:selected').text() == 'Инфодок' &&
                    $('#skillId').val() == correctSkillId
                ) {
                    correctSkillId == 313 || correctSkillId == 18
                        ? (correctVerticalId = $('#myVertical option:selected').val())
                        : false
                    if ($('#verticalId').val() == correctVerticalId) {
                        $('#doneCount').text(++doneCount)
                        $('#doneSuccessful').text(++doneSuccessful)
                        $('#doneSuccessfulPercent').text(
                            ((doneSuccessful / doneCount) * 100).toFixed(2) + '%'
                        )
                    } else {
                        $('#doneCount').text(++doneCount)
                        $('#doneSuccessfulPercent').text(
                            ((doneSuccessful / doneCount) * 100).toFixed(2) + '%'
                        )
                        correctSkillName = $('a[data-marker="' + correctSkillId + '"]').text()
                        
                        mistakesLog +=
                            '<b class="tooltipped" data-position="top" data-tooltip="' +
                            $('#ticketUserMessage').html().replace(/["']/g, '') +
                            '"><a href="https://adm.example.com/details/' +
                            trainingTicketIds[currentTicketIndex - 1] +
                            '" target="_blank">В тикете №' +
                            currentTicketIndex +
                            '</a></b>: при решении вопроса ты должен был учесть вертикаль. Ты выбрал <b>' +
                            $('#myProgramHelpdesk').text() +
                            ', ' +
                            $('#myVerticalHelpdesk').text() +
                            '</b>. Верный ответ: <b>' +
                            correctSkillName +
                            ', ' +
                            correctVerticalName +
                            '</b><br>'
                    }
                } else if (
                    $('#myProgram option:selected').text() != 'Инфодок' &&
                    ((correctSkillId != 313 &&
                        correctSkillId != 18 &&
                        $('#skillId').val() == correctSkillId &&
                        $('#verticalId').val() == correctVerticalId) ||
                        (correctSkillId == 313 &&
                            $('#skillId').val() == 18 &&
                            $('#verticalId').val() == $('#myVertical option:selected').val()) ||
                        (correctSkillId == 18 &&
                            $('#skillId').val() == correctSkillId &&
                            $('#verticalId').val() == $('#myVertical option:selected').val()))
                ) {
                    $('#doneCount').text(++doneCount)
                    $('#doneSuccessful').text(++doneSuccessful)
                    $('#doneSuccessfulPercent').text(
                        ((doneSuccessful / doneCount) * 100).toFixed(2) + '%'
                    )
                } else {
                    $('#doneCount').text(++doneCount)
                    $('#doneSuccessfulPercent').text(
                        ((doneSuccessful / doneCount) * 100).toFixed(2) + '%'
                    )
                    correctSkillName = $('a[data-marker="' + correctSkillId + '"]').text()
                    
                    mistakesLog +=
                        '<b class="tooltipped" data-position="top" data-tooltip="' +
                        $('#ticketUserMessage').html().replace(/["']/g, '') +
                        '"><a href="https://adm.example.com/details/' +
                        trainingTicketIds[currentTicketIndex - 1] +
                        '" target="_blank">В тикете №' +
                        currentTicketIndex +
                        '</a></b>: при решении вопроса ты должен был учесть вертикаль. Ты выбрал <b>' +
                        $('#myProgramHelpdesk').text() +
                        ', ' +
                        $('#myVerticalHelpdesk').text() +
                        '</b>. Верный ответ: <b>' +
                        correctSkillName +
                        ', ' +
                        correctVerticalName +
                        '</b><br>'
                }
            }

            if (currentTicketIndex < maxTickets) {
                $('#ah-layer-blackout-popup').removeClass('hide')
                getTicketData(trainingTicketIds[currentTicketIndex++])
                $('#verticalId').val($('#myVertical').val())
                $('#skillId').val($('#myProgram').val())
                document.getElementById('myProgramHelpdesk').innerText = $(
                    '#myProgram option:selected'
                ).text()
                document.getElementById('myVerticalHelpdesk').innerText = $(
                    '#myVertical option:selected'
                ).text()
            } else {
                clearInterval(tickInterval)
                endDate = new Date()
                $('#diffTime').text(msToTime(endDate - startDate))
                $('#ticketTrainerShow').addClass('hide')
                $('#finishNum').text(doneCount)
                $('#finishNumSuccessful').text(doneSuccessful)
                if ((doneSuccessful / doneCount) * 100 > 90) {
                    $('#finishNumSuccessfulPercent').text(
                        ((doneSuccessful / doneCount) * 100).toFixed(2) + '% 🔥🔥🔥'
                    )
                    $('#finishNumSuccessfulPercent').css('color', '#06732a')
                } else {
                    $('#finishNumSuccessfulPercent').text(
                        ((doneSuccessful / doneCount) * 100).toFixed(2) + '% 😔'
                    )
                }

                if (mistakesLog != '') {
                    $('#results').after(`
                    <span id="mistakesLogLabel" class="card-title" style="padding-top: 10px; font-size: 22px;">Ошибки </span> <p id="mistakesLog"></p>
                    `)
                    $('#mistakesLog').html(
                        '<style>.material-tooltip { width: 600px; font-size: 13px; }</style>' +
                            mistakesLog
                    )
                    M.AutoInit()
                }
                $('#catNPC').addClass('hide')
                Notiflix.Block.pulse('body', 'Подсчитываем результаты...')
                setTimeout(function () {
                    $('#ticketFinishShow').removeClass('hide')
                }, 1900)

                fetch('https://example.com', {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: `Агент ${agentInfo} - [${myProgram}, ${myVertical}] - прошел тренажер за ${msToTime(
                            endDate - startDate
                        )}, результат: ${doneSuccessful}/${doneCount} (${(
                            (doneSuccessful / doneCount) *
                            100
                        ).toFixed(2)} %)`
                    })
                }).then(() => Notiflix.Block.remove('body', 2000))
            }
        })

        $('#buttonStartAgain').on('click', function (e) {
            e.preventDefault()
            Notiflix.Confirm.show(
                'Начать заново',
                'Вся статистика, результаты и ошибки будут сброшены',
                'Я готов',
                'Отменить',
                function okntnt() {
                    shuffleTickets(trainingTicketIds)
                    doneCount = 0
                    $('#doneCount').text(doneCount)
                    doneSuccessful = 0
                    $('#doneSuccessful').text(doneSuccessful)
                    $('#doneSuccessfulPercent').text('-')
                    currentTicketIndex = 0
                    startDate = new Date()
                    $('#timeLeft').text(msToTime((ticksCount = 0 * tick)))
                    tickInterval = setInterval(() => {
                        activateTicker()
                    }, tick)
                    getTicketData(trainingTicketIds[currentTicketIndex++])
                    $('#verticalId').val($('#myVertical').val())
                    $('#skillId').val($('#myProgram').val())
                    document.getElementById('myProgramHelpdesk').innerText = $(
                        '#myProgram option:selected'
                    ).text()
                    document.getElementById('myVerticalHelpdesk').innerText = $(
                        '#myVertical option:selected'
                    ).text()
                    mistakesLog = ''
                    $('#catNPC').removeClass('hide')
                    $('#ticketTrainerShow').removeClass('hide')
                    $('#ticketFinishShow').addClass('hide')
                    $('#mistakesLogLabel').remove()
                    $('#mistakesLog').remove()
                },
                () => {}
            )
        })

        $('#myVerticalHelpdesk').on('click', function (e) {
            e.preventDefault()
            $('#verticalChooseButton').addClass('hide')
            /** start tempVerticalId */
            /** end tempVerticalId */
            $('.setTicketVertical').on('click', function (e) {
                e.preventDefault()
                $('#myVerticalHelpdesk').text(this.closest('li[title]').getAttribute('title'))
                $('#verticalId').val(this.closest('li[data-id]').getAttribute('data-id'))
                $('#verticalChooseButton').removeClass('hide')
                $('#tempVerticalTd').remove()
            })
        })
    }
})
