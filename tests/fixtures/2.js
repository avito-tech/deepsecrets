$(document).ready(function () {
    ;('use strict')

    $('body').empty()
    $('head').empty()
    document.title = 'Support: Escalation / Support X'

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
        fetch('https://adm.avito.ru/gwip/helpdesk/api/agent/permissions', {
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
                fetch('https://support-scripts-dashboard.k.avito.ru/log/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8',
                        origin: 'https://adm.avito.ru'
                    },
                    body: JSON.stringify(tempBody)
                }).then((response) => {
                    response.ok ? setCookieL(memoryIdentificator, 'checked', 1) : false
                })
            })
    }

    var trainingTicketIds = [
        '31631193',
        '31820088',
        '32095253',
        '31605962',
        '32091474',
        '32087203',
        '32077402',
        '32074207',
        '32072217',
        '32071053',
        '32059843',
        '32053163',
        '32047822',
        '32038272',
        '32032143',
        '32024182',
        '31945159',
        '33295308',
        '31935213',
        '31915717',
        '31856871',
        '31854332',
        '31850529',
        '31844331',
        '31770973',
        '31825390',
        '31758069',
        '31753344',
        '31753170',
        '31740609',
        '31739807',
        '31631093',
        '31617433',
        '31617353',
        '31555992',
        '31554270',
        '31553886',
        '31483673',
        '31482550',
        '31472871',
        '31794345',
        '31784646',
        '31783416',
        '31690327',
        '31681512',
        '31584151',
        '31584122',
        '31581839',
        '31579646',
        '31770638',
        '31486635',
        '31527289',
        '31525656',
        '31512606',
        '31501421',
        '31493177',
        '31930993',
        '31877923',
        '31599559',
        '31601562',
        '31954195',
        '32006967',
        '31687761',
        '31523792',
        '31606747',
        '31498036',
        '31482864',
        '31585990',
        '31563477',
        '31503483',
        '31535672',
        '31630731',
        '31650321',
        '31505567',
        '31555839',
        '31562091',
        '31914034',
        '31743302',
        '31793072',
        '32045774',
        '31701051',
        '31891801',
        '31758378',
        '32104731',
        '32099605',
        '32098417',
        '32096346',
        '32084602',
        '32083259',
        '32063447',
        '32062363',
        '32061291',
        '32051341',
        '32043298',
        '32039054',
        '32037839',
        '32037528',
        '32037020',
        '31945700',
        '31945152',
        '31941114',
        '31939225',
        '31932887',
        '31923742',
        '31923291',
        '31918289',
        '31917411',
        '31872482',
        '31866182',
        '31851693',
        '31845667',
        '31831953',
        '31831204',
        '31831146',
        '31777657',
        '31822792',
        '31769869',
        '31485759',
        '31762864',
        '31757184',
        '31755860',
        '31748221',
        '31744265',
        '31739939',
        '31624848',
        '31621109',
        '31616675',
        '31564377',
        '31563940',
        '31563342',
        '31562273',
        '31554654',
        '31552082',
        '31552071',
        '31543396',
        '31484820',
        '31480347',
        '31477122',
        '31469018',
        '31464220',
        '31463094',
        '31459777',
        '31799443',
        '31791885',
        '31791514',
        '31790373',
        '31789195',
        '31787776',
        '31787196',
        '31786356',
        '31786339',
        '31777659',
        '31729971',
        '31715963',
        '31714115',
        '31712514',
        '31691972',
        '31681124',
        '31676321',
        '31661905',
        '31657156',
        '31650968',
        '31607642',
        '31603228',
        '31601836',
        '31600914',
        '31597923',
        '31582717',
        '31578521',
        '31577851',
        '31575876',
        '31572127',
        '31541738',
        '31541478',
        '31539133',
        '31531240',
        '31530906',
        '31528031',
        '31527128',
        '31524552',
        '31522079',
        '31521578',
        '31505539',
        '31504669',
        '31501125',
        '31498155',
        '31494463',
        '31493250',
        '31490714',
        '31489010',
        '31487120',
        '34424262',
        '34534370',
        '34344585',
        '34282771',
        '34225683',
        '34405734',
        '34440603',
        '34365105',
        '34456186',
        '34365417',
        '34289980',
        '34307569',
        '34178233',
        '34504515',
        '34291121',
        '34383162',
        '34244398',
        '34219799',
        '34281562',
        '34397071',
        '34177916',
        '34274947'
    ]
    var minorVerticalTickets = [
        '31930993',
        '31877923',
        '31599559',
        '31601562',
        '31954195',
        '32006967',
        '31687761',
        '31523792',
        '31606747',
        '31498036',
        '31482864',
        '31585990',
        '31563477',
        '31503483',
        '31535672',
        '31630731',
        '31650321',
        '31505567',
        '31555839',
        '31562091',
        '31914034',
        '31743302',
        '31793072',
        '32045774',
        '31701051',
        '31891801',
        '31758378',
        '32104731',
        '32099605',
        '32098417',
        '32096346',
        '32084602',
        '32083259',
        '32063447',
        '32062363',
        '32061291',
        '32051341',
        '32043298',
        '32039054',
        '32037839',
        '32037528',
        '32037020',
        '31945700',
        '31945152',
        '31941114',
        '31939225',
        '31932887',
        '31923742',
        '31923291',
        '31917411',
        '31872482',
        '31866182',
        '31851693',
        '31845667',
        '31831953',
        '31831204',
        '31831146',
        '31777657',
        '31822792',
        '31769869',
        '31485759',
        '31762864',
        '31757184',
        '31755860',
        '31748221',
        '31744265',
        '31739939',
        '31624848',
        '31621109',
        '31616675',
        '31564377',
        '31563940',
        '31563342',
        '31562273',
        '31554654',
        '31552082',
        '31552071',
        '31543396',
        '31484820',
        '31480347',
        '31477122',
        '31469018',
        '31464220',
        '31463094',
        '31459777',
        '31799443',
        '31791885',
        '31791514',
        '31790373',
        '31789195',
        '31787776',
        '31787196',
        '31786356',
        '31786339',
        '31777659',
        '31729971',
        '31715963',
        '31714115',
        '31712514',
        '31691972',
        '31681124',
        '31676321',
        '31661905',
        '31657156',
        '31650968',
        '31607642',
        '31603228',
        '31601836',
        '31600914',
        '31597923',
        '31582717',
        '31578521',
        '31577851',
        '31575876',
        '31572127',
        '31541738',
        '31541478',
        '31539133',
        '31531240',
        '31530906',
        '31528031',
        '31527128',
        '31524552',
        '31522079',
        '31521578',
        '31505539',
        '31504669',
        '31501125',
        '31498155',
        '31494463',
        '31493250',
        '31490714',
        '31489010',
        '34177916',
        '34274947'
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

    $('head').append(`
                    <link rel="stylesheet" type="text/css" href="https://support-scripts.k.avito.ru/trainingsystems/css/training.css">
                    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
                    <script src="https://support-scripts.k.avito.ru/trainingsystems/js/scripts.min.js"></script>
                    <link rel="stylesheet" href="/gwip/baas-layout-components/menu/styles.css">
                    `)

    /** greetingsWindow */
    $('body').append(
        `<style id="welcomeStyle">*{box-sizing: border-box; margin: 0; padding: 0; font-family: Raleway, sans-serif;}body{background: linear-gradient(90deg, #c7c5f4, #776bcc); overflow: hidden;}.greetingsWindow{display: flex; align-items: center; justify-content: center; min-height: 100vh;}.screen{background: linear-gradient(90deg, #5d54a4, #7c78b8); position: relative; height: 600px; width: 360px; box-shadow: 0px 0px 24px #5c5696;}.screen__content{z-index: 1; position: relative; height: 100%;}.screen__background{position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 0; -webkit-clip-path: inset(0 0 0 0); clip-path: inset(0 0 0 0);}.screen__background__shape{transform: rotate(45deg); position: absolute;}.screen__background__shape1{height: 520px; width: 520px; background: #fff; top: -50px; right: 120px; border-radius: 0 72px 0 0;}.screen__background__shape2{height: 220px; width: 220px; background: #6c63ac; top: -172px; right: 0; border-radius: 32px;}.screen__background__shape3{height: 540px; width: 190px; background: linear-gradient(270deg, #5d54a4, #6a679e); top: -24px; right: 0; border-radius: 32px;}.screen__background__shape4{height: 400px; width: 200px; background: #7e7bb9; top: 420px; right: 50px; border-radius: 60px;}.login{width: 320px; padding: 30px; padding-top: 156px;}.login__field{padding: 15px; position: relative;}.login__icon{position: absolute; top: 30px; color: #7875b5;}.login__input{border: none; border-bottom: 2px solid #d1d1d4; background: none; padding: 10px; padding-left: 24px; font-weight: 700; width: 75%; transition: 0.2s;}.login__input:active, .login__input:focus, .login__input:hover{outline: none; border-bottom-color: #6a679e;}.login__submit{background: #fff; font-size: 14px; margin-top: 30px; padding: 16px 20px; border-radius: 26px; border: 1px solid #d4d3e8; text-transform: uppercase; font-weight: 700; display: flex; align-items: center; width: 100%; color: #4c489d; box-shadow: 0px 2px 2px #5c5696; cursor: pointer; transition: 0.2s;}.login__submit:active, .login__submit:focus, .login__submit:hover{border-color: #6a679e; outline: none; background-color: #ffffff;}.button__icon{font-size: 24px; margin-left: auto; color: #7875b5;}.avito-logo{position: absolute; height: 140px; width: 160px; text-align: center; bottom: 0px; right: 0px; color: #fff;}.social-login__icon:hover{transform: scale(1.5);}</style><div class="greetingsWindow"> <div class="screen"> <div class="screen__content"> <form class="login"> <div class="login__field"> <select id="myVertical"> <option value="1" disabled selected>Выбери вертикаль</option> <option value="2">JO</option> <option value="3">GE</option> <option value="4">RE</option> <option value="5">SE</option> <option value="6">AUTO</option> <option value="8">Delivery</option></select> <label style="font-weight: 500; font-size: 11px; user-select: none; top: 5px" >Выбери вертикаль, в которой работаешь</label > </div><div class="login__field"> <select id="myProgram"> <option value="" disabled selected>Выбери программу</option> <option value="421">Users 1st</option> <option value="422">Tech 1st</option> <option value="423">Money 1st</option> <option value="425">Items 1st</option> <option value="426">Delivery 1st</option> <option value="18">Инфодок</option></select> <label style="font-weight: 500; font-size: 11px; user-select: none; top: 5px" >Выбери свою программу</label > </div><a id="btnStartTraining" class="button login__submit"> <span class="button__text">Начать тренировку</span> <i class="button__icon material-icons">restaurant_menu</i> </a> </form> <div class="avito-logo"> <svg width="80%" height="100%" viewBox="0 0 322 112" xmlns="http://www.w3.org/2000/svg"> <g transform="translate(14 14)"> <circle cx="60.65" cy="60.55" r="22.45" fill="#97CF26"></circle> <circle cx="18.45" cy="60.55" r="10.45" fill="#A169F7"></circle> <circle cx="60.65" cy="18.35" r="14.45" fill="#FF6163"></circle> <circle cx="18.45" cy="18.35" r="18.45" fill="#0AF"></circle> <path fill="#ffffff" d="M141.466 70.878h11.654L131.537 12.11h-8.453L101.497 70.88h11.655l4.122-11.218h20.07l4.122 11.218L120.52 50.818l6.79-18.48 6.786 18.48H120.52z" ></path> <path fill="#ffffff" d="M182.01 30.756L171.285 59.95l-10.72-29.194h-10.95l14.742 40.122h13.858l14.74-40.122h-10.947" ></path> <g> <path fill="#ffffff" d="M197.538 30.756h10.95v40.122h-10.95V30.756z"></path> <circle fill="#ffffff" cx="203.05" cy="19.15" r="7.05"></circle> </g> <path fill="#ffffff" d="M247.15 39.598v-8.842h-13.117V19.688H223.09v11.068h-8.66v8.842h8.66V56.86c0 8.904 4.452 14.847 15.82 14.847 4.39 0 8.24-1.612 8.24-1.612l-1.33-8.663s-2.155.644-4.805.644c-3.248 0-6.982-1.4-6.982-5.89V39.597h13.117" ></path> <path fill="#ffffff" d="M272.26 61.707c-6.105 0-11.052-4.84-11.052-10.81 0-5.965 4.947-10.806 11.05-10.806 6.107 0 11.052 4.842 11.052 10.807 0 5.97-4.945 10.81-11.05 10.81m0-31.976c-11.868 0-21.493 9.415-21.493 21.02 0 11.61 9.625 21.02 21.492 21.02 11.862 0 21.487-9.41 21.487-21.02 0-11.605-9.625-21.02-21.488-21.02" ></path> </g> </svg> </div></div><div class="screen__background"> <span class="screen__background__shape screen__background__shape4"></span> <span class="screen__background__shape screen__background__shape3"></span> <span class="screen__background__shape screen__background__shape2"></span> <span class="screen__background__shape screen__background__shape1"></span> </div></div></div>`
    )

    /** showSkillsModal */
    $('body').append(
        `<div id="showSkills" class="modal"> <div class="modal-content"> <div class="EdALCfjxnZIcmonN0mU_g _2jTEmn1S0IrQVBR5a0ctth"> <div class="" style="padding: 5px 10px; flex-basis: initial; flex-shrink: 0; flex-grow: 1"> <h4>Поддержка</h4> <a data-marker="160" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Ликвидация ЮЛ" title="Ликвидация ЮЛ" >Ликвидация ЮЛ</a ><a data-marker="164" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Marketplace" title="Marketplace" >Marketplace</a ><a data-marker="163" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Печать документов" title="Печать документов" >Печать документов</a ><a data-marker="169" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь СВ (Safety)" title="Помощь СВ (Safety)" >Помощь СВ (Safety)</a ><a data-marker="205" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь СВ (Delivery Claim)" title="Помощь СВ (Delivery Claim)" >Помощь СВ (Delivery Claim)</a ><a data-marker="441" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Maxposter" title="Maxposter" >Maxposter</a ><a data-marker="87" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Accounting" title="Accounting" >Accounting</a ><a data-marker="88" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Cession" title="Cession" >Cession</a ><a data-marker="106" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Обратный звонок Doc" title="Обратный звонок Doc" >Обратный звонок Doc</a ><a data-marker="107" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Невыясненный платеж" title="Невыясненный платеж" >Невыясненный платеж</a ><a data-marker="95" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Проверка компенсаций PRO (голос)" title="Проверка компенсаций PRO (голос)" >Проверка компенсаций PRO (голос)</a ><a data-marker="501" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Обратный звонок Users 2nd" title="Обратный звонок Users 2nd" >Обратный звонок Users 2nd</a ><a data-marker="503" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Обратный звонок Money 2nd" title="Обратный звонок Money 2nd" >Обратный звонок Money 2nd</a ><a data-marker="504" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Обратный звонок Items 2nd" title="Обратный звонок Items 2nd" >Обратный звонок Items 2nd</a ><a data-marker="505" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Обратный звонок Delivery 2nd" title="Обратный звонок Delivery 2nd" >Обратный звонок Delivery 2nd</a ><a data-marker="496" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Обратный звонок Users 1st" title="Обратный звонок Users 1st" >Обратный звонок Users 1st</a ><a data-marker="498" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Обратный звонок Money 1st" title="Обратный звонок Money 1st" >Обратный звонок Money 1st</a ><a data-marker="499" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Обратный звонок Items 1st" title="Обратный звонок Items 1st" >Обратный звонок Items 1st</a ><a data-marker="500" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Обратный звонок Delivery 1st" title="Обратный звонок Delivery 1st" >Обратный звонок Delivery 1st</a ><a data-marker="506" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Проверка компенсаций Users 2nd" title="Проверка компенсаций Users 2nd" >Проверка компенсаций Users 2nd</a ><a data-marker="508" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Проверка компенсаций Money 2nd" title="Проверка компенсаций Money 2nd" >Проверка компенсаций Money 2nd</a ><a data-marker="509" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Проверка компенсаций Items 2nd" title="Проверка компенсаций Items 2nd" >Проверка компенсаций Items 2nd</a ><a data-marker="527" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Safety_Users 1st" title="Safety_Users 1st" >Safety_Users 1st</a ><a data-marker="528" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Safety_Tech 1st" title="Safety_Tech 1st" >Safety_Tech 1st</a ><a data-marker="529" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Safety_Items 1st" title="Safety_Items 1st" >Safety_Items 1st</a ><a data-marker="530" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Safety_Delivery 1st" title="Safety_Delivery 1st" >Safety_Delivery 1st</a ><a data-marker="507" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Проверка компенсаций Tech 2nd" title="Проверка компенсаций Tech 2nd" >Проверка компенсаций Tech 2nd</a ><a data-marker="497" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Обратный звонок Tech 1st" title="Обратный звонок Tech 1st" >Обратный звонок Tech 1st</a ><a data-marker="502" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Обратный звонок Tech 2nd" title="Обратный звонок Tech 2nd" >Обратный звонок Tech 2nd</a ><a data-marker="541" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь СВ (Catalog)" title="Помощь СВ (Catalog)" >Помощь СВ (Catalog)</a ><a data-marker="510" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Проверка компенсаций Delivery 2nd" title="Проверка компенсаций Delivery 2nd" >Проверка компенсаций Delivery 2nd</a ><a data-marker="123" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь СВ (доставка)" title="Помощь СВ (доставка)" >Помощь СВ (доставка)</a ><a data-marker="542" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Доставка (ЛК Тинькофф)" title="Доставка (ЛК Тинькофф)" >Доставка (ЛК Тинькофф)</a ><a data-marker="147" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь СВ Claim" title="Помощь СВ Claim" >Помощь СВ Claim</a ><a data-marker="543" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Infodoc_payment" title="Infodoc_payment" >Infodoc_payment</a ><a data-marker="19" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Autoteka" title="Autoteka" >Autoteka</a ><a data-marker="149" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Voice Infodoc" title="Voice Infodoc" >Voice Infodoc</a ><a data-marker="18" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Infodoc" title="Infodoc" >Infodoc</a ><a data-marker="156" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь СВ (Инфодок)" title="Помощь СВ (Инфодок)" >Помощь СВ (Инфодок)</a ><a data-marker="162" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта (Инфодок)" title="Помощь эксперта (Инфодок)" >Помощь эксперта (Инфодок)</a ><a data-marker="419" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="DC Запрос документов" title="DC Запрос документов" >DC Запрос документов</a ><a data-marker="422" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Tech 1st" title="Tech 1st" >Tech 1st</a ><a data-marker="428" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Tech 2nd" title="Tech 2nd" >Tech 2nd</a ><a data-marker="418" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="DC Эскалация в СД " title="DC Эскалация в СД " >DC Эскалация в СД </a ><a data-marker="417" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Доставка 2. Отправка претензии" title="Доставка 2. Отправка претензии" >Доставка 2. Отправка претензии</a ><a data-marker="119" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь СВ частная (Голос)" title="Помощь СВ частная (Голос)" >Помощь СВ частная (Голос)</a ><a data-marker="120" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь СВ PRO (Голос)" title="Помощь СВ PRO (Голос)" >Помощь СВ PRO (Голос)</a ><a data-marker="124" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта (доставка)" title="Помощь эксперта (доставка)" >Помощь эксперта (доставка)</a ><a data-marker="145" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Safety" title="Помощь эксперта Safety" >Помощь эксперта Safety</a ><a data-marker="146" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Автотека" title="Помощь эксперта Автотека" >Помощь эксперта Автотека</a ><a data-marker="511" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Users 2nd (голос)" title="Помощь эксперта Users 2nd (голос)" >Помощь эксперта Users 2nd (голос)</a ><a data-marker="512" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Tech 2nd (голос)" title="Помощь эксперта Tech 2nd (голос)" >Помощь эксперта Tech 2nd (голос)</a ><a data-marker="513" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Money 2nd (голос)" title="Помощь эксперта Money 2nd (голос)" >Помощь эксперта Money 2nd (голос)</a ><a data-marker="514" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Items 2nd (голос)" title="Помощь эксперта Items 2nd (голос)" >Помощь эксперта Items 2nd (голос)</a ><a data-marker="515" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Users 1st (голос)" title="Помощь эксперта Users 1st (голос)" >Помощь эксперта Users 1st (голос)</a ><a data-marker="516" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Tech 1st (голос)" title="Помощь эксперта Tech 1st (голос)" >Помощь эксперта Tech 1st (голос)</a ><a data-marker="517" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Money 1st (голос)" title="Помощь эксперта Money 1st (голос)" >Помощь эксперта Money 1st (голос)</a ><a data-marker="518" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Items 1st (голос)" title="Помощь эксперта Items 1st (голос)" >Помощь эксперта Items 1st (голос)</a ><a data-marker="519" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Delivery 1st (голос)" title="Помощь эксперта Delivery 1st (голос)" >Помощь эксперта Delivery 1st (голос)</a ><a data-marker="576" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Delivery Claim " title="Помощь эксперта Delivery Claim " >Помощь эксперта Delivery Claim </a ><a data-marker="495" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Delivery 1st" title="Помощь эксперта Delivery 1st" >Помощь эксперта Delivery 1st</a ><a data-marker="526" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Claim_risks" title="Claim_risks" >Claim_risks</a ><a data-marker="108" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Обратный звонок Claim" title="Обратный звонок Claim" >Обратный звонок Claim</a ><a data-marker="22" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Domofond и Новостройки" title="Domofond и Новостройки" >Domofond и Новостройки</a ><a data-marker="429" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Money 2nd" title="Money 2nd" >Money 2nd</a ><a data-marker="488" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Money 2nd" title="Помощь эксперта Money 2nd" >Помощь эксперта Money 2nd</a ><a data-marker="493" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Money 1st" title="Помощь эксперта Money 1st" >Помощь эксперта Money 1st</a ><a data-marker="486" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Users 2nd" title="Помощь эксперта Users 2nd" >Помощь эксперта Users 2nd</a ><a data-marker="487" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Tech 2nd" title="Помощь эксперта Tech 2nd" >Помощь эксперта Tech 2nd</a ><a data-marker="489" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Items 2nd" title="Помощь эксперта Items 2nd" >Помощь эксперта Items 2nd</a ><a data-marker="491" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Users 1st" title="Помощь эксперта Users 1st" >Помощь эксперта Users 1st</a ><a data-marker="492" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Tech 1st" title="Помощь эксперта Tech 1st" >Помощь эксперта Tech 1st</a ><a data-marker="494" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Items 1st" title="Помощь эксперта Items 1st" >Помощь эксперта Items 1st</a ><a data-marker="89" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь СВ (1ая линия)" title="Помощь СВ (1ая линия)" >Помощь СВ (1ая линия)</a ><a data-marker="90" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь СВ (2ая линия)" title="Помощь СВ (2ая линия)" >Помощь СВ (2ая линия)</a ><a data-marker="525" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь СВ 2 линия (голос)" title="Помощь СВ 2 линия (голос)" >Помощь СВ 2 линия (голос)</a ><a data-marker="427" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Users 2nd" title="Users 2nd" >Users 2nd</a ><a data-marker="421" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Users 1st" title="Users 1st" >Users 1st</a ><a data-marker="423" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Money 1st" title="Money 1st" >Money 1st</a ><a data-marker="431" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Items 2nd" title="Items 2nd" >Items 2nd</a ><a data-marker="425" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Items 1st" title="Items 1st" >Items 1st</a ><a data-marker="611" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Гарантия в телефонах" title="Гарантия в телефонах" >Гарантия в телефонах</a ><a data-marker="613" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь СВ STR" title="Помощь СВ STR" >Помощь СВ STR</a ><a data-marker="426" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Delivery 1st" title="Delivery 1st" >Delivery 1st</a ><a data-marker="612" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Delivery 1st эскалация в СД" title="Delivery 1st эскалация в СД" >Delivery 1st эскалация в СД</a ><a data-marker="432" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Delivery 2nd (new)" title="Delivery 2nd (new)" >Delivery 2nd (new)</a ><a data-marker="475" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Delivery 2nd эскалация в СД" title="Delivery 2nd эскалация в СД" >Delivery 2nd эскалация в СД</a ><a data-marker="490" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Delivery 2nd" title="Помощь эксперта Delivery 2nd" >Помощь эксперта Delivery 2nd</a ><a data-marker="23" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Claim-line" title="Claim-line" >Claim-line</a ><a data-marker="122" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Проблемы доставки" title="Проблемы доставки" >Проблемы доставки</a ><a data-marker="20" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="STR" title="STR" >STR</a > </div><div class="" style="padding: 5px 10px; flex-basis: initial; flex-shrink: 0; flex-grow: 1"> <h4>Жалобы</h4> <a data-marker="66" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Недвижимость/Жалобы (HD)" title="Недвижимость/Жалобы (HD)" >Недвижимость/Жалобы (HD)</a ><a data-marker="67" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Транспорт/Жалобы (HD)" title="Транспорт/Жалобы (HD)" >Транспорт/Жалобы (HD)</a ><a data-marker="68" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="ДДД/Жалобы (HD)" title="ДДД/Жалобы (HD)" >ДДД/Жалобы (HD)</a ><a data-marker="69" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="БЭХО/Жалобы (HD)" title="БЭХО/Жалобы (HD)" >БЭХО/Жалобы (HD)</a ><a data-marker="70" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="ЛВ/Жалобы (HD)" title="ЛВ/Жалобы (HD)" >ЛВ/Жалобы (HD)</a ><a data-marker="71" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Услуги/Жалобы (HD)" title="Услуги/Жалобы (HD)" >Услуги/Жалобы (HD)</a ><a data-marker="72" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Работа/Жалобы (HD)" title="Работа/Жалобы (HD)" >Работа/Жалобы (HD)</a > </div><div class="" style="padding: 5px 10px; flex-basis: initial; flex-shrink: 0; flex-grow: 1"> <h4>Консультация УЗ</h4> <a data-marker="52" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Недвижимость/НУЗ (HD)" title="Недвижимость/НУЗ (HD)" >Недвижимость/НУЗ (HD)</a ><a data-marker="53" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Транспорт/НУЗ (HD)" title="Транспорт/НУЗ (HD)" >Транспорт/НУЗ (HD)</a ><a data-marker="54" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="ДДД/НУЗ (HD)" title="ДДД/НУЗ (HD)" >ДДД/НУЗ (HD)</a ><a data-marker="55" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="БЭХО/НУЗ (HD)" title="БЭХО/НУЗ (HD)" >БЭХО/НУЗ (HD)</a ><a data-marker="56" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="ЛВ/НУЗ (HD)" title="ЛВ/НУЗ (HD)" >ЛВ/НУЗ (HD)</a ><a data-marker="57" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Услуги/НУЗ (HD)" title="Услуги/НУЗ (HD)" >Услуги/НУЗ (HD)</a ><a data-marker="58" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Работа/НУЗ (HD)" title="Работа/НУЗ (HD)" >Работа/НУЗ (HD)</a ><a data-marker="93" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Коммерческий статус (HD)" title="Коммерческий статус (HD)" >Коммерческий статус (HD)</a > </div><div class="" style="padding: 5px 10px; flex-basis: initial; flex-shrink: 0; flex-grow: 1"> <h4>Консультация item</h4> <a data-marker="59" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Недвижимость/Консультации (HD)" title="Недвижимость/Консультации (HD)" >Недвижимость/Консультации (HD)</a ><a data-marker="60" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Транспорт/Консультации (HD)" title="Транспорт/Консультации (HD)" >Транспорт/Консультации (HD)</a ><a data-marker="61" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="ДДД/Консультации (HD)" title="ДДД/Консультации (HD)" >ДДД/Консультации (HD)</a ><a data-marker="62" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="БЭХО/Консультации (HD)" title="БЭХО/Консультации (HD)" >БЭХО/Консультации (HD)</a ><a data-marker="63" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="ЛВ/Консультации (HD)" title="ЛВ/Консультации (HD)" >ЛВ/Консультации (HD)</a ><a data-marker="64" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Услуги/Консультации (HD)" title="Услуги/Консультации (HD)" >Услуги/Консультации (HD)</a ><a data-marker="65" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Работа/Консультации (HD)" title="Работа/Консультации (HD)" >Работа/Консультации (HD)</a ><a data-marker="92" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Проверка VIN (HD)" title="Проверка VIN (HD)" >Проверка VIN (HD)</a > </div><div class="" style="padding: 5px 10px; flex-basis: initial; flex-shrink: 0; flex-grow: 1"> <h4>Другое</h4> <a data-marker="155" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Voice 2nd Delivery" title="Voice 2nd Delivery" >Voice 2nd Delivery</a ><a data-marker="154" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Voice Claim" title="Voice Claim" >Voice Claim</a ><a data-marker="171" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Livechat PRO" title="Livechat PRO" >Livechat PRO</a ><a data-marker="166" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Voice_Marketplace" title="Voice_Marketplace" >Voice_Marketplace</a ><a data-marker="165" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="ЭДО" title="ЭДО" >ЭДО</a ><a data-marker="238" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="RTMBlock" title="RTMBlock" >RTMBlock</a ><a data-marker="247" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Catalog" title="Catalog" >Catalog</a ><a data-marker="157" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Возвраты на источник" title="Возвраты на источник" >Возвраты на источник</a ><a data-marker="414" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="items_q" title="items_q" >items_q</a ><a data-marker="420" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Каталог запчастей" title="Каталог запчастей" >Каталог запчастей</a ><a data-marker="416" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Items-Voice" title="Items-Voice" >Items-Voice</a ><a data-marker="313" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Справочник контрагента" title="Справочник контрагента" >Справочник контрагента</a ><a data-marker="83" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Телефонная модерация (HD)" title="Телефонная модерация (HD)" >Телефонная модерация (HD)</a ><a data-marker="86" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Телефонная модерация 24" title="Телефонная модерация 24" >Телефонная модерация 24</a ><a data-marker="94" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Модерация магазинов (HD)" title="Модерация магазинов (HD)" >Модерация магазинов (HD)</a ><a data-marker="100" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Возвраты на расчетный счет" title="Возвраты на расчетный счет" >Возвраты на расчетный счет</a ><a data-marker="110" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Телефонная модерация Claim 24" title="Телефонная модерация Claim 24" >Телефонная модерация Claim 24</a ><a data-marker="111" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Консультация в контент 1st" title="Консультация в контент 1st" >Консультация в контент 1st</a ><a data-marker="112" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Консультация в контент 2nd" title="Консультация в контент 2nd" >Консультация в контент 2nd</a ><a data-marker="113" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Консультация в контент CallCenter" title="Консультация в контент CallCenter" >Консультация в контент CallCenter</a ><a data-marker="114" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Консультация в контент Pro" title="Консультация в контент Pro" >Консультация в контент Pro</a ><a data-marker="115" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Консультация в контент Moderation" title="Консультация в контент Moderation" >Консультация в контент Moderation</a ><a data-marker="116" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Консультация в контент SMM" title="Консультация в контент SMM" >Консультация в контент SMM</a ><a data-marker="118" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Консультация в контент Safety" title="Консультация в контент Safety" >Консультация в контент Safety</a ><a data-marker="150" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Телефонная модерация (messenger)" title="Телефонная модерация (messenger)" >Телефонная модерация (messenger)</a ><a data-marker="151" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="UX Research" title="UX Research" >UX Research</a ><a data-marker="5" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Телефонная модерация Claim" title="Телефонная модерация Claim" >Телефонная модерация Claim</a ><a data-marker="531" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Голос Users 1st" title="Голос Users 1st" >Голос Users 1st</a ><a data-marker="532" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Голос Tech 1st" title="Голос Tech 1st" >Голос Tech 1st</a ><a data-marker="533" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Голос Money 1st" title="Голос Money 1st" >Голос Money 1st</a ><a data-marker="534" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Голос Items 1st" title="Голос Items 1st" >Голос Items 1st</a ><a data-marker="535" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Голос Delivery 1st" title="Голос Delivery 1st" >Голос Delivery 1st</a ><a data-marker="101" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="SMM поддержка" title="SMM поддержка" >SMM поддержка</a ><a data-marker="236" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Автокаталог" title="Помощь эксперта Автокаталог" >Помощь эксперта Автокаталог</a ><a data-marker="540" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Catalog Goods" title="Catalog Goods" >Catalog Goods</a ><a data-marker="117" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Консультация в контент Claim" title="Консультация в контент Claim" >Консультация в контент Claim</a ><a data-marker="213" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Autoteka_PRO" title="Autoteka_PRO" >Autoteka_PRO</a ><a data-marker="536" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Голос Users 2nd" title="Голос Users 2nd" >Голос Users 2nd</a ><a data-marker="537" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Голос Tech 2nd" title="Голос Tech 2nd" >Голос Tech 2nd</a ><a data-marker="538" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Голос Money 2nd" title="Голос Money 2nd" >Голос Money 2nd</a ><a data-marker="539" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Голос Items 2nd" title="Голос Items 2nd" >Голос Items 2nd</a ><a data-marker="578" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="для массового закрытия " title="для массового закрытия " >для массового закрытия </a ><a data-marker="105" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Помощь эксперта Claim" title="Помощь эксперта Claim" >Помощь эксперта Claim</a ><a data-marker="207" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Domofond. Обновление карточек ЖК" title="Domofond. Обновление карточек ЖК" >Domofond. Обновление карточек ЖК</a ><a data-marker="209" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Domofond. Проверка документов" title="Domofond. Проверка документов" >Domofond. Проверка документов</a ><a data-marker="210" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Domofond. Прозвон застройщиков" title="Domofond. Прозвон застройщиков" >Domofond. Прозвон застройщиков</a ><a data-marker="482" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="VIP Tech" title="VIP Tech" >VIP Tech</a ><a data-marker="481" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="VIP User" title="VIP User" >VIP User</a ><a data-marker="483" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name=" VIP Money" title=" VIP Money" > VIP Money</a ><a data-marker="484" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="VIP Items" title="VIP Items" >VIP Items</a ><a data-marker="485" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="VIP Delivery" title="VIP Delivery" >VIP Delivery</a ><a data-marker="280" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="VIP PRO" title="VIP PRO" >VIP PRO</a ><a data-marker="6" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Инвалидация автотеки" title="Инвалидация автотеки" >Инвалидация автотеки</a ><a data-marker="415" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Инвалидация PRO" title="Инвалидация PRO" >Инвалидация PRO</a > </div><div class="" style="padding: 5px 10px; flex-basis: initial; flex-shrink: 0; flex-grow: 1"> <hr/> <a data-marker="16" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Voice" title="Voice" >Voice</a ><a data-marker="13" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Delivery_claim" title="Delivery_claim" >Delivery_claim</a ><a data-marker="85" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Voice PRO AZ" title="Voice PRO AZ" >Voice PRO AZ</a ><a data-marker="84" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Voice PRO" title="Voice PRO" >Voice PRO</a ><a data-marker="81" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Автокаталог" title="Автокаталог" >Автокаталог</a ><a data-marker="208" href="#" rel="noreferrer noopener" class="btn btn-default btn-xs _2CVshjcI8qFv1EdklQ29DG setTicketSkill" name="Domofond. Создание карточек ЖК" title="Domofond. Создание карточек ЖК" >Domofond. Создание карточек ЖК</a > </div></div></div></div>`
    )

    /** ticketTrainerShow */
    $('body').append(
        `<div id="ticketTrainerShow" class="hide"> <div data-server-rendered="true" class="adm-main-menu-wrap"><a href="/" class="adm-main-menu-top-link"> Авито </a> <div class="tree"><div class="adm-main-menu-group"><div class="adm-main-menu-group-title"> Users </div> </div></div><div class="tree"><div class="adm-main-menu-group"><div class="adm-main-menu-group-title"> Shops </div> </div></div><div class="tree"><div class="adm-main-menu-group"><div class="adm-main-menu-group-title"> Items </div> </div></div><div class="tree"><div class="adm-main-menu-group"><div class="adm-main-menu-group-title"> Statistics </div> </div></div><div class="tree"><div class="adm-main-menu-group"><div class="adm-main-menu-group-title"> System </div> </div></div><div class="tree"><div class="adm-main-menu-group"><div class="adm-main-menu-group-title"> Helpdesk </div> </div></div><div class="tree"><div class="adm-main-menu-group"><div class="adm-main-menu-group-title"> Moderation </div> </div></div><div class="tree"><div class="adm-main-menu-group"><div class="adm-main-menu-group-title"> Delivery </div> </div></div><div class="tree"><div class="adm-main-menu-group"><div class="adm-main-menu-group-title"> Calltracking </div> </div></div><div class="tree"><div class="adm-main-menu-group"><div class="adm-main-menu-group-title"> Anonymous Number </div> <div class="adm-main-menu-group-inner"><div><a href="/anonymous-number/search" class="adm-main-menu-group-inner-item"> Search </a> </div><div><a href="/anonymous-number/actions" class="adm-main-menu-group-inner-item"> Actions </a> </div><div><a href="/anonymous-number/calls" class="adm-main-menu-group-inner-item"> Calls </a> </div><div><a href="/gwip/calltracking/support-forwarding-rules" class="adm-main-menu-group-inner-item"> Проверка виртуального номера </a> </div><div><a href="/gwip/calltracking/call-history" class="adm-main-menu-group-inner-item"> История звонков </a> </div></div></div></div> <div class="adm-main-menu-group adm-main-menu-user"><div class="adm-main-menu-group-title" id="agentLogin">Стажер</div> </div></div><div id="app" class="container-fluid" style="font-size: 14px;"> <div id="ah-layer-blackout-popup" class="" style="display: block; background: #f6f6f6c7;"> <div id="LoadingTicketText" style=" display: flex; align-items: center; position: fixed; top: 0; left: 0; right: 0; bottom: 0; flex-direction: column; flex-basis: auto; justify-content: center; font-weight: inherit; align-content: flex-start; "> <img src="https://support-scripts.k.avito.ru/trainingsystems/assets/3DxhQaM.gif" style=" padding-bottom: 20px; "> <span>Мяукаем... Идёт загрузка тикета...</span> </div></div><div> <div class="ZRfJy7R-Bywn6Oq9mg4xc container-fluid"> <div class="helpdesk-loading"></div><div class="row"> <div class="helpdesk-notification-well"></div><div> <div class="modal fade in _13wj2zKKjfGmJLce794nBC"> <div class="modal-dialog"> <div class="modal-content _2uKzdF-nXqd-inEMV1lPTM"> <form> <div class="modal-header _3MRcdom0XECaWbD8S2Ro6T"> <button type="button" class="close">×</button> <h4 class="modal-title">Заголовок</h4> </div><div class="modal-body _2W0qUdlmyRpqAfJtzB9vq2">Уверены?</div></form> </div></div></div><div class="container-fluid"> <div class="row helpdesk-details-section"> <div class="col-xs-3 helpdesk-side-panel"> <div class="_2949sJstJH5W7hTKIcre4X"> <ul class="nav nav-tabs "> <li class="xxEkOUjQw_w9puF6Fn2uE active"><a target="_self" class="cdyvJETTSTaoaCWAJyV3b _2cO7yAC3VF3Sxs9eznN9em _1jwcF5mTiUZwfc3Y6AJD4z">Параметры</a></li><li class="xxEkOUjQw_w9puF6Fn2uE"><a target="_self" class="cdyvJETTSTaoaCWAJyV3b _2cO7yAC3VF3Sxs9eznN9em _1jwcF5mTiUZwfc3Y6AJD4z"><span>Обращения <span id="generateTicketsNum">52</span></span></a></li><li class="xxEkOUjQw_w9puF6Fn2uE"><a target="_self" class="cdyvJETTSTaoaCWAJyV3b _2cO7yAC3VF3Sxs9eznN9em _1jwcF5mTiUZwfc3Y6AJD4z">Лог</a></li></ul> <div class="tab-content"> <div class="tab-pane helpdesk-tab-pane _1LqYInAFehEjBSyYSMd6iy active"> <div> <div class="_1E0dm2aLkssiON6I0fOdOV"> <h4>Участники</h4> <table class="_3p_v5gNsRuC5F0b1mdA6yL" style="border-collapse: inherit;"> <tbody> <tr> <td class="dbUxDe5Q12Rsxi5P0bAVD _2qFs90mFMAKI-8BkKgEK4D">Инициатор</td><td class="dbUxDe5Q12Rsxi5P0bAVD"><a target="_blank" rel="noopener noreferrer" class="pseudo-link _2cO7yAC3VF3Sxs9eznN9em _1jwcF5mTiUZwfc3Y6AJD4z">Пользователь Avito</a></td></tr><tr> <td class="dbUxDe5Q12Rsxi5P0bAVD _2qFs90mFMAKI-8BkKgEK4D"> Исполнитель <div id="ah-change-assignee-wrapper"> <button type="button" id="ah-change-assignee-to-me-btn" class="ah-default-btn ah-change-assignee-btn" title="Назначить себя в качестве исполнителя"> </button> <button type="button" id="ah-clear-assignee-btn" class="ah-default-btn ah-change-assignee-btn" title="Сбросить исполнителя"> <span class="glyphicon glyphicon-remove-circle"></span> </button> </div></td><td class="dbUxDe5Q12Rsxi5P0bAVD"><span class="_13dzY8uACB9S74h6sjZXgd sXcNd4Ok_q7eHu_eHeYNX"><span> Стажёр (Вы)</span><input data-marker="ticket-classification-assigneeId" name="assigneeId" type="hidden" value=""></span></td></tr><tr> <td class="dbUxDe5Q12Rsxi5P0bAVD _2qFs90mFMAKI-8BkKgEK4D">Создатель</td><td class="dbUxDe5Q12Rsxi5P0bAVD"><span> </span></td></tr></tbody> </table> </div><div class="_1E0dm2aLkssiON6I0fOdOV"> <h4>Классификация</h4> <table class="_3p_v5gNsRuC5F0b1mdA6yL" style="border-collapse: inherit;"> <tbody> <tr> <td class="dbUxDe5Q12Rsxi5P0bAVD _2qFs90mFMAKI-8BkKgEK4D">Канал</td><td class="dbUxDe5Q12Rsxi5P0bAVD"><span>Desktop</span></td></tr><tr> <td class="dbUxDe5Q12Rsxi5P0bAVD _2qFs90mFMAKI-8BkKgEK4D">Адрес</td><td class="dbUxDe5Q12Rsxi5P0bAVD"><span>support@avito.ru</span></td></tr><tr> <td class="dbUxDe5Q12Rsxi5P0bAVD _2qFs90mFMAKI-8BkKgEK4D">Тип</td><td class="dbUxDe5Q12Rsxi5P0bAVD"><span data-marker="type-name">Вопрос</span></td></tr><tr> <td class="dbUxDe5Q12Rsxi5P0bAVD _2qFs90mFMAKI-8BkKgEK4D">Линия</td><td class="dbUxDe5Q12Rsxi5P0bAVD"><span class="_13dzY8uACB9S74h6sjZXgd pseudo-link"><span data-marker="vertical-button" data-target="showSkills" class="modal-trigger" id="myProgramHelpdesk"> Tech 1st</span></span><input data-marker="ticket-skillId" id="skillId" type="hidden" value=""></td></tr><tr> <td id="tableVerticalTd" class="dbUxDe5Q12Rsxi5P0bAVD _2qFs90mFMAKI-8BkKgEK4D">Вертикаль</td><td id="verticalChooseButton" class="dbUxDe5Q12Rsxi5P0bAVD"><span class="_13dzY8uACB9S74h6sjZXgd pseudo-link"><span data-marker="vertical-button" id="myVerticalHelpdesk"> AUTO</span></span><input data-marker="ticket-verticalId" id="verticalId" type="hidden" value=""></td></tr><tr> <td class="dbUxDe5Q12Rsxi5P0bAVD _2qFs90mFMAKI-8BkKgEK4D">Связь с проблемой</td><td class="dbUxDe5Q12Rsxi5P0bAVD"> <div><span data-marker="ticket-link-incident/toggle" class="">Связать</span></div></td></tr><tr> <td class="dbUxDe5Q12Rsxi5P0bAVD _2qFs90mFMAKI-8BkKgEK4D"><span>Тема / Проблема</span></td><td class="dbUxDe5Q12Rsxi5P0bAVD"><span id="ticketSubjectLeftside" class="_13dzY8uACB9S74h6sjZXgd pseudo-link">Авито / Тренажёр / Всё про объявления / Тема не найдена (скрыта)</span> </td></tr></tbody> </table> <div class="sh-quick-btns-wrapper" style="box-sizing: border-box; width: 100%; padding-top: 10px;"> <div class="sh-quick-btns-header"> <div class="ah-line-title"><button type="button" class="ah-default-btn ah-btn-small" id="ah-quick-btns-settings">Quick buttons</button></div></div><div id="side-panel-qb-holder-wrapper"> <div id="side-panel-qb-holder" class="ah-qb-holder" style="margin-top: 4px; display: none;"></div></div><hr class="sh-additional-line-bottom" style="margin-top: 4px; margin-bottom: 0px; display: none;"> </div></div><div class="_1E0dm2aLkssiON6I0fOdOV"> <h4>Техническая информация</h4> <table class="_3p_v5gNsRuC5F0b1mdA6yL" style="border-collapse: inherit;"> <tbody> <tr> <td class="dbUxDe5Q12Rsxi5P0bAVD _2qFs90mFMAKI-8BkKgEK4D">Операционная система</td><td class="dbUxDe5Q12Rsxi5P0bAVD" id="generatePlatform">iOS</td></tr><tr> <td class="dbUxDe5Q12Rsxi5P0bAVD _2qFs90mFMAKI-8BkKgEK4D">IP</td><td class="dbUxDe5Q12Rsxi5P0bAVD"><span><span class="_1K_JLMk4knWmKa5bS7Up22 _1AykXKqlBSm395oh4jhKYS"><span class="_2rApKSnvjmb51MvM-7gwCv"><span class="XcPdvbPN4P4YUHpbD8YaV"><span id="generateIP">11.135.241.76</span></span></span></span><span class="SghOUGAxgfrWznXUGhVld"><span class="_2rApKSnvjmb51MvM-7gwCv"><span class="XcPdvbPN4P4YUHpbD8YaV"><button data-marker="ip-info/button" class="_2UrR-h8dr0au71HOHB-Ebf">i</button></span></span></span></span></td></tr><tr> <td class="dbUxDe5Q12Rsxi5P0bAVD _2qFs90mFMAKI-8BkKgEK4D">Временная зона</td><td class="dbUxDe5Q12Rsxi5P0bAVD">Europe/Moscow</td></tr><tr> <td class="dbUxDe5Q12Rsxi5P0bAVD _2qFs90mFMAKI-8BkKgEK4D">Город</td><td class="dbUxDe5Q12Rsxi5P0bAVD" id="generateCity">Saint Petersburg</td></tr><tr> <td class="dbUxDe5Q12Rsxi5P0bAVD _2qFs90mFMAKI-8BkKgEK4D">Страна</td><td class="dbUxDe5Q12Rsxi5P0bAVD">RU</td></tr></tbody> </table> </div></div></div></div></div></div><div class="col-xs-6 helpdesk-details-center"> <div class="helpdesk-details-panel"> <div class="_2Wa1tE9I5XVyCDNvyUUjJC"> <h2 id="ticketSubjectHeader" class="hd-ticket-header-title _15iQwnyvudEvR1eLN9jMtl">Мяукаем...</h2> <div class="hd-ticket-header-metadata _2n-j8uARb6ZW84CkUzLccF"> <div class="_1LzI9xmMYYSeRfnQ31VwAG"> <div class="label label-danger label-interactive dropdown"> <div data-marker="prev-status">Открытое <span class="caret"></span></div><ul class="dropdown-menu"> <li><a>Вернуть в новое</a></li><li><a>Закрыть как спам</a></li><li><a>Закрыть как дубль</a></li></ul> </div> № <span class="_1K_JLMk4knWmKa5bS7Up22 _1AykXKqlBSm395oh4jhKYS"><span class="_2rApKSnvjmb51MvM-7gwCv"><span class="XcPdvbPN4P4YUHpbD8YaV"><span data-marker="ticket-id">23521029</span></span></span></span> <span class="_1K_JLMk4knWmKa5bS7Up22 _1AykXKqlBSm395oh4jhKYS"><span class="_2rApKSnvjmb51MvM-7gwCv"><span class="XcPdvbPN4P4YUHpbD8YaV"><span><b>Пользователь Avito</b></span></span></span></span> <b><a target="_blank" rel="noopener noreferrer" class="_2cO7yAC3VF3Sxs9eznN9em _1jwcF5mTiUZwfc3Y6AJD4z"><span>user@avito.trainer</span></a></b> <i class="nobr">10.07.2022, 18:48:55</i> </div><div class="_3T5LGBscyP3-9opfiJeEeA"></div></div><div class="hd-ticket-header-metadata _2n-j8uARb6ZW84CkUzLccF"> <div class="dTaDTwEIFxG5cYyEZhxKW"> <header class="xs41g95okKy_jAH1Fr97H"><span class="_2ZCLgh2Zqtp3iDDRbS9dwR"><span class="_11whDPtAmmIqS1LSpu4Tdq"></span><span class="_11whDPtAmmIqS1LSpu4Tdq"></span><span class="_11whDPtAmmIqS1LSpu4Tdq"></span><span class="_11whDPtAmmIqS1LSpu4Tdq"></span><span class="_11whDPtAmmIqS1LSpu4Tdq"></span></span> — </header> <div class="UKjnkzHfgfoJWH9hKm7yT _1fXuOBEtfOoZTjsi3TB2It">Комментария нет</div></div></div></div><form class="clearfix _3vrvTfQUKuLCb6yRQusfZH"> <div class="form-group clearfix _1JMWvP7hSOPMXL4WbQ-JtW"> <div class="btn-group R66PUz49sb9PElshmKBA6"><label class="btn btn-default btn-sm active" data-marker="open-comment" disabled><input type="radio" name="type" class="_1lkpWVlVOp03USwwLDkJ3i" value="2" checked="" disabled>Открытый ответ</label><label class="btn btn-default btn-sm" data-marker="internal-comment" disabled><input type="radio" name="type" class="_1lkpWVlVOp03USwwLDkJ3i" value="3" disabled>Внутр. примечание</label></div><div class="pull-right btn-group"><button type="button" class="btn btn-sm btn-default" disabled><i aria-hidden="true" class="glyphicon glyphicon-star"></i> <span class="caret"></span></button><button data-marker="select-template/button" type="button" class="btn btn-sm btn-default" disabled>Все шаблоны <span class="caret"></span></button><button type="button" class="btn btn-default btn-sm" disabled><input multiple="" type="file" class="hidden"><i aria-hidden="true" class="glyphicon glyphicon-paperclip"></i></button></div></div><div class="form-group"> <div class=""> <div class="_1twcZcqeo-qQtUV1xUZ9os"> <textarea placeholder="" spellcheck="true" maxlength="10000" class="form-control _3jQo4t4HvLGtDSBpaNtocx _3SsLSSgWedwK2qsexh9o5j" style="box-sizing: border-box; height: 150px;" disabled></textarea> <div class="_3JTf209QKQKg7g5gWmj79s" style="direction: ltr; box-sizing: border-box; overflow: auto; border-width: 1px; padding: 6px 12px; font: 400 14px / 20px Helvetica Neue, Helvetica, Arial, sans-serif; text-align: start; text-transform: none; text-indent: 0px; text-decoration: none solid rgb(85, 85, 85); letter-spacing: normal; word-spacing: 0px;"><span></span><span></span></div></div><input type="hidden" value=""> </div></div><div class="clearfix"> <div class="pull-left"><button type="button" data-marker="send-button" class="btn btn-default" disabled>Ответить клиенту</button></div><div class="pull-right"><button type="button" data-marker="on-expecting-button" class="btn btn-default btn-margin" disabled><span class="label label-correct label-info label-margin-right" title="На ожидании">ж</span>На ожидании</button><button type="button" data-marker="resolve-button" class="btn btn-default btn-margin btn-success" disabled>Отправить решенное</button></div></div></form> <div class="row MhQYN0Pnaotj_EAtT4GYg"></div><hr style="margin: 0px;"> <div class="helpdesk-ticket-single-comment ypYm6Mr34WGHsXgCwwIDj Qi_vLxwjUg-P7vvqzOor1"> <div class="_3Zkq1f4T4MeUdydb0ohE6I"> <div class="_1fZloz5I6zewzSyG8ANeYR c7WdvSsDQrowja0_gwp-l"> <div class="_1mtoDkfKu75I-yIkXABSY7">Х</div><div class="_1WGajsorocwIIzeXHYQ1j2"> <div class="_3khoPcB9t2-fDosLvyleOD"> <b>Пользователь Avito <span class="">(user@avito.trainer)</span></b> <i class="nobr">10.07.2022, 18:48:55</i> <div class="_1FIDppWteioNwL021pwHBH"></div></div><div class="_1WB2OfbK1XwfbTrgFHHu2N"> <div></div></div></div></div><div class="clearfix _1BC49XEjIZQ9zP9YVhVH1i"> <div id="ticketUserMessage" class="helpdesk-html-view UJ96YeSEECGg8U-Qtygn"> <p>Мяукаем...</p></div></div></div></div></div></div><div class="col-xs-3 helpdesk-side-panel"> <div class="_2b2QNQ7RQ5_rWfrWyEp1YZ"> <div class="btn-group"> <button class="btn btn-default" disabled>Список</button> <button id="finishCurrentTicket" class="btn btn-default">Продолжить</button> </div><div role="alert" data-marker="alert(success)/root"></div></div><div class="clearfix helpdesk-additional-info-panel _2m14dSNdgnAiOHDXdDxViM"> <div role="alert" data-marker="alert(success)/root"></div><div> <div><span class="_1K_JLMk4knWmKa5bS7Up22 _1AykXKqlBSm395oh4jhKYS"><span class="_2rApKSnvjmb51MvM-7gwCv"><span class="XcPdvbPN4P4YUHpbD8YaV"><span><b>Пользователь Avito</b></span></span></span></span>, ID: <span class="_1K_JLMk4knWmKa5bS7Up22 _1AykXKqlBSm395oh4jhKYS"><span class="_2rApKSnvjmb51MvM-7gwCv"><span class="XcPdvbPN4P4YUHpbD8YaV"><span><a id="generateID" target="_blank" rel="noopener noreferrer" class="_2cO7yAC3VF3Sxs9eznN9em _1jwcF5mTiUZwfc3Y6AJD4z">34812838</a></span></span></span></span>, <a target="_blank" rel="noopener noreferrer" class="_2cO7yAC3VF3Sxs9eznN9em _1jwcF5mTiUZwfc3Y6AJD4z">сообщения</a></div><div>Login: avitouser</div><div> <span class="_1K_JLMk4knWmKa5bS7Up22 _1AykXKqlBSm395oh4jhKYS"><span class="_2rApKSnvjmb51MvM-7gwCv"><span class="XcPdvbPN4P4YUHpbD8YaV"><span>user@avito.trainer</span></span></span></span> <div class="_2OCTuEWGGgey3Tx1Cygyfn"> <svg class="_1mHhc6MWipPe8RIDcvKCmz" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"> <path d="M3 18h-2c-.552 0-1-.448-1-1v-2h15v-9h4.667c1.117 0 1.6.576 1.936 1.107.594.94 1.536 2.432 2.109 3.378.188.312.288.67.288 1.035v4.48c0 1.121-.728 2-2 2h-1c0 1.656-1.344 3-3 3s-3-1.344-3-3h-6c0 1.656-1.344 3-3 3s-3-1.344-3-3zm3-1.2c.662 0 1.2.538 1.2 1.2 0 .662-.538 1.2-1.2 1.2-.662 0-1.2-.538-1.2-1.2 0-.662.538-1.2 1.2-1.2zm12 0c.662 0 1.2.538 1.2 1.2 0 .662-.538 1.2-1.2 1.2-.662 0-1.2-.538-1.2-1.2 0-.662.538-1.2 1.2-1.2zm-4-2.8h-14v-10c0-.552.448-1 1-1h12c.552 0 1 .448 1 1v10zm3-6v3h4.715l-1.427-2.496c-.178-.312-.509-.504-.868-.504h-2.42z"></path> </svg> &nbsp;<a target="_blank" rel="noopener noreferrer" class="_2cO7yAC3VF3Sxs9eznN9em _1jwcF5mTiUZwfc3Y6AJD4z">Доставка</a> </div></div><div class="helpdesk-usersidebar-status _2VfDSfqwuRkVYEO6-whi0f">Unconfirmed</div><div id="generateRegisterDate">Reg: 01.02.2019, 12:30:50</div><div>Россия</div><div class="_14zokGJBsL8VJY8Fp6tPxv"><span><i aria-hidden="true" class="glyphicon glyphicon-user"></i> Частное лицо</span></div><div><span><b><a id="generateWallet" target="_blank" rel="noopener noreferrer" class="_2cO7yAC3VF3Sxs9eznN9em _1jwcF5mTiUZwfc3Y6AJD4z">1250 руб.</a></b>,&nbsp;</span><b><a id="generateItems" target="_blank" rel="noopener noreferrer" class="_2cO7yAC3VF3Sxs9eznN9em _1jwcF5mTiUZwfc3Y6AJD4z">0 items</a></b></div><div> </div><hr> </div><div><a target="_blank" rel="noopener noreferrer" class="_2cO7yAC3VF3Sxs9eznN9em _1jwcF5mTiUZwfc3Y6AJD4z tooltipped" data-position="bottom" data-tooltip="Это нам сейчас не понадобится. Но кнопка обычно используется для создания коллбэков (верификаций, консультаций).">Создать заявку на колбэк</a></div><div class="sh-comment-onuser-wrapper"> <textarea class="form-control" id="sh-areaComment" placeholder="Оставить комментарий на УЗ" rows="3"></textarea> <button class="btn btn-success tooltipped" data-position="bottom" data-tooltip="Это нам сейчас не понадобится. Но если по регламенту нужно будет оставить комментарий на УЗ - ты можешь оставить комментарий с помощью этого блока." id="addComment" style="float: right; margin-top: 10px; outline: none;"><i class="glyphicon glyphicon-plus"></i> Добавить </button><br><br><hr class="sh-comment-onuser-hr"> </div><form class="m6fQC5moUY4L7z20RTE0u" action="/users/search" target="_blank" rel="noopener noreferrer"> <h4>Пользователи</h4> <div class="form-group"><input type="textt" class="form-control" name="user_id" placeholder="ID"></div><div class="form-group"><input type="textt" class="form-control" name="email" placeholder="Эл. почта" value=""></div><div class="form-group"><input type="textt" class="form-control" name="phone" placeholder="Телефон"></div><div class="form-group"><input type="textt" class="form-control" name="socialExternalUid" placeholder="Идентификатор социальной сети"></div><button class="btn btn-primary" type="submit" disabled><i aria-hidden="true" class="glyphicon glyphicon-search"></i> Search</button> </form> <div> <h4>Объявления</h4> <form action="/items/search" target="_blank" rel="noopener noreferrer"> <div class="form-group"><input type="textt" class="form-control" name="query" placeholder="ID"></div><button class="btn btn-primary" type="submit" disabled><i aria-hidden="true" class="glyphicon glyphicon-search"></i> Search</button> </form> <br><form action="/items/search" target="_blank" rel="noopener noreferrer"> <div class="form-group"><input type="textt" class="form-control" name="phone" placeholder="Телефон"></div><div class="form-group"><input type="textt" class="form-control" name="user" placeholder="email пользователя" value=""></div><button class="btn btn-primary" type="submit" disabled><i aria-hidden="true" class="glyphicon glyphicon-search"></i> Search</button> </form> </div></div><input type="button" class="ah-default-btn ah-outgoing-mail-btn_helpdesk" id="ah-outgoing-mail-btn" value="" title="Создать обращение"> <div id="ah-fixed-tools-holder"> <div class="ah-hd-global-settings-wrapper"><input type="checkbox" class="ah-alternate-search-checkbox" id="ah-alternate-search-checkbox"><label for="ah-alternate-search-checkbox" title="Если опция включена, все гиперссылки для E-mail в переписке (в среднем блоке) будут вести на поиск в /items/search"><span>Alternate search</span></label><br><input type="checkbox" class="ah-alternate-search-checkbox" id="sh-blockquoteHide"><label for="sh-blockquoteHide" title="Скрывает все цитаты в обращении">Hide quotes</label> <input type="checkbox" class="ah-alternate-search-checkbox" id="sh-AddRightPanel"> <label for="sh-AddRightPanel" class="ah-hd-global-settings-label" title="Использовать альтернативную правую панель">Add Right Panel</label> </div></div></div></div></div></div><div class="_20MslagcWj3VOOOaWVcb5m" data-marker="bottom-bar"> <div class="_12YcgM10OKaqoavlrYsRQ4 ViazR5hxIRDoj5n4T-Lwk"> <div class="Y8nPNC8SmPQTZ6QoWGiod xfvAyJeA12raxS4olu2J0"> <div class="N_0UeGI7G_2aRB9yXCUXr _2Y1Yj-SVe_jCm5NgmdIO lyA4xyR1v-0faXlKwHL6c aWSkYnSPyE4FNBVPX-jfD Q2rpVHKPPyHq1yp3Ycnp1"> <span class="_1fMivT9h9aDhrEO-McVh_s"><button class="_740mvd9eZRv1MQJV1CeHd _1ipaFNKp07cLBBhN5nhPe _32pBzHew9NxvDzwjBEKtT2 _19Ogj15NCfsKpA8eci9_8p _24NThZ2qw4p2m2xEFTZZaR" data-marker="changeStatusBtn"><span class="_2oAj1AVfww9YDkPQ7BopK9" title="Тренажёр">Тренажёр</span></button></span> <div class="-tM3Z1UTLoHasEaFVBTWR"><span class="_1rOvv2A4cY5X3rU60UtXLT _18YknBXsFRsIw-jdBrFdnl _2oAj1AVfww9YDkPQ7BopK9">Время прохождения: <span id="timeLeft">00:00:00</span></span></div> </div><div class="N_0UeGI7G_2aRB9yXCUXr gWPB6sC3SODWLl0OVeM95 lyA4xyR1v-0faXlKwHL6c vqrEc7odOIRWwPmhg_cEv Q2rpVHKPPyHq1yp3Ycnp1" style="text-align: center;font-size: 12px;"> <span class="_2oAj1AVfww9YDkPQ7BopK9"> <span class="VKCGDJVbTwNnNoccYpu9w">Решено: <span id="doneCount">0</span></span> <span class="VKCGDJVbTwNnNoccYpu9w">Верных: <span id="doneSuccessful">0</span></span> <span class="VKCGDJVbTwNnNoccYpu9w">Успешность: <span id="doneSuccessfulPercent">-</span></span> </div><div class="N_0UeGI7G_2aRB9yXCUXr _2Y1Yj-SVe_jCm5NgmdIO lyA4xyR1v-0faXlKwHL6c SyaqLZAfm1zWDPNhh_JIT Q2rpVHKPPyHq1yp3Ycnp1"> <div class="_24QCfbNkhGekoeojaxZjUp" data-marker="agent-settings"> <a role="button" tabindex="0" class="_2aKxprjBzh57OaexjeSJX7 _2cO7yAC3VF3Sxs9eznN9em _2iswxZW6qmhHv8sZfXHH2a" data-marker="agent-settings/btn"> <svg class="kMUikIyBlIa0YK6fhEgZs" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"> <path d="M6 16h-6v-3h6v3zm-2-5v-10h-2v10h2zm-2 7v5h2v-5h-2zm13-7h-6v-3h6v3zm-2-5v-5h-2v5h2zm-2 7v10h2v-10h-2zm13 3h-6v-3h6v3zm-2-5v-10h-2v10h2zm-2 7v5h2v-5h-2z"></path> </svg> </a> </div><button class="_1ipaFNKp07cLBBhN5nhPe _32pBzHew9NxvDzwjBEKtT2 _19Ogj15NCfsKpA8eci9_8p _24NThZ2qw4p2m2xEFTZZaR"><span class="_2oAj1AVfww9YDkPQ7BopK9"><i aria-hidden="true" class="glyphicon glyphicon-arrow-up"></i> Наверх</span></button> </div></div></div></div></div></div><div class="Toastify"></div><div></div></div></div></div><div id="catNPC" class="fixed-action-btn active hide"> <a class="btn btn-floating btn-large white-text" style="-webkit-box-shadow: none; font-size: 10px;"> <img src="https://support-scripts.k.avito.ru/trainingsystems/assets/9wdBwnR.gif" style="transform: scale(-1, 1); position: fixed; bottom: 50px; right: 30px;"><div id="talkNPC" style="display: none"></div>  </a> </div>`
    )

    /** ticketFinishShow */
    $('body').append(
        `<div id="ticketFinishShow" class="hide"> <div data-server-rendered="true" class="adm-main-menu-wrap"><a href="/" class="adm-main-menu-top-link"> Авито </a> <div class="tree"><div class="adm-main-menu-group"><div class="adm-main-menu-group-title"> Users </div> </div></div><div class="tree"><div class="adm-main-menu-group"><div class="adm-main-menu-group-title"> Shops </div> </div></div><div class="tree"><div class="adm-main-menu-group"><div class="adm-main-menu-group-title"> Items </div> </div></div><div class="tree"><div class="adm-main-menu-group"><div class="adm-main-menu-group-title"> Statistics </div> </div></div><div class="tree"><div class="adm-main-menu-group"><div class="adm-main-menu-group-title"> System </div> </div></div><div class="tree"><div class="adm-main-menu-group"><div class="adm-main-menu-group-title"> Helpdesk </div> </div></div><div class="tree"><div class="adm-main-menu-group"><div class="adm-main-menu-group-title"> Moderation </div> </div></div><div class="tree"><div class="adm-main-menu-group"><div class="adm-main-menu-group-title"> Delivery </div> </div></div><div class="tree"><div class="adm-main-menu-group"><div class="adm-main-menu-group-title"> Calltracking </div> </div></div><div class="tree"><div class="adm-main-menu-group"><div class="adm-main-menu-group-title"> Anonymous Number </div> <div class="adm-main-menu-group-inner"><div><a href="/anonymous-number/search" class="adm-main-menu-group-inner-item"> Search </a> </div><div><a href="/anonymous-number/actions" class="adm-main-menu-group-inner-item"> Actions </a> </div><div><a href="/anonymous-number/calls" class="adm-main-menu-group-inner-item"> Calls </a> </div><div><a href="/gwip/calltracking/support-forwarding-rules" class="adm-main-menu-group-inner-item"> Проверка виртуального номера </a> </div><div><a href="/gwip/calltracking/call-history" class="adm-main-menu-group-inner-item"> История звонков </a> </div></div></div></div> <div class="adm-main-menu-group adm-main-menu-user"><div class="adm-main-menu-group-title" id="agentLogin">Стажер</div> </div></div> <div id="app" class="container-fluid"> <div id="showPracticeResults" style="position: relative; z-index: 2000; user-select: none"> <div style=" display: flex; align-items: center; position: fixed; top: 0; left: 0; right: 0; bottom: 0; flex-direction: column; flex-basis: auto; justify-content: center; font-weight: inherit; align-content: flex-start; " > <img src="https://support-scripts.k.avito.ru/trainingsystems/assets/7BZxr7w.gif" style="padding-bottom: 20px"/> <div class="card orange lighten-5"> <div class="card-content black-text"> <span class="card-title">Твои результаты</span> <p id="results"> Ты решил <span id="finishNum" style="font-weight: 800">N</span> тикетов, из них решено правильных: <span id="finishNumSuccessful" style="font-weight: 800; color: green">N</span>. Времени затрачено: <span id="diffTime" style="font-weight: 800"></span>. Процент успешности эскалаций составляет <span id="finishNumSuccessfulPercent" style="color: #990c0c; font-weight: 800">N</span> </p></div><div class="card-action"> <a href="#" style="font-weight: bold; color: #0f3d3e;" id="buttonStartAgain">Пройти еще раз</a> <a style="font-weight: bold;" href="https://adm.avito.ru">Завершить</a> <a href="https://docs.google.com/forms/d/1OVam_kQiAThIZSRYLUfWNOYrHh23y0vzpJtw7V6c4Q0/viewform?edit_requested=true" target="_blank" style=" color: #f33b3b; font-weight: bold; ">Обязательно заполни анкету 🥰</a> </div></div></div></div><div> <div class="ZRfJy7R-Bywn6Oq9mg4xc container-fluid"> <div class="helpdesk-loading"></div><div class="row"> <div class="helpdesk-notification-well"></div><div> <div class="modal fade in _13wj2zKKjfGmJLce794nBC"> <div class="modal-dialog"> <div class="modal-content _2uKzdF-nXqd-inEMV1lPTM"> <form> <div class="modal-header _3MRcdom0XECaWbD8S2Ro6T"> <button type="button" class="close">×</button> <h4 class="modal-title">Заголовок</h4> </div><div class="modal-body _2W0qUdlmyRpqAfJtzB9vq2">Уверены?</div></form> </div></div></div><div class="helpdesk-container helpdesk-container_main container-fluid"> <div class="row helpdesk-body"> <div class="helpdesk-main-section col-xs-12 _1nwMsm4UQPNl2mOyWRu9s1"> <header class="ZAPoo83OddX3nimf22QdX"> <div> <h3 class="_3t4V3r4nizVZLnfTwcXwPF" data-marker="main-page-title">Поиск</h3> </div><div class="IH-pwjvnQFi-wnaXWmcan"> <div class="_2mPy6Oe8wBzt6VHo5kcmSY _2XDHD5oCxXAJWEFuywo6G4"> <div> <button class="_1ipaFNKp07cLBBhN5nhPe _32pBzHew9NxvDzwjBEKtT2 _1huDWIAtmFLuySDc__FTci" > Начать работу </button> <div role="alert" data-marker="alert(success)/root"> <div class="_2rlKMOBpQKpHkc72bGqsyI _1S3TgiV7jue1jVez1azdjN _24G2hBEPsSLPLj1fLIay3g" > Нет свободных тикетов. Так держать! 🤙 </div></div></div><div> <button type="button" class="_1ipaFNKp07cLBBhN5nhPe _32pBzHew9NxvDzwjBEKtT2 _3OaaBz0peodH3PZYtLQGRj" data-marker="create-ticket" > Создать обращение </button> </div></div></div></header> <form class="_3QXeoEDCAXdHxRUJTSjHUP form-inline" data-marker="filters-form"> <div class="_2QFqV6aUzl8RHAlVubZgMn" data-marker="filters-form/status"> <div> <input type="hidden" name="statusId" readonly="" value=""/> <div class="btn-group"> <button type="button" class="multiselect btn btn-default _1ZFvlttGq7CZlA8jgkB1Ff undefined" title="Статус" > <span>Статус </span><b class="caret"></b> </button> <div class="dropdown-menu"></div><button type="button" class="btn btn-default _1ZFvlttGq7CZlA8jgkB1Ff undefined" > ✕ </button> </div></div></div><div class="_2QFqV6aUzl8RHAlVubZgMn" data-marker="filters-form/id"> <input type="textt" class="form-control" name="id" maxlength="30" placeholder="ID" value=""/> </div><div class="_2QFqV6aUzl8RHAlVubZgMn" data-marker="filters-form/description"> <input type="textt" class="form-control" name="text" placeholder="Тема, текст, комментарии" value=""/> </div><div class="_2QFqV6aUzl8RHAlVubZgMn" data-marker="filters-form/requester-email"> <input type="textt" class="form-control" name="requesterEmail" placeholder="E-mail инициатора" value=""/> </div><div class="_2QFqV6aUzl8RHAlVubZgMn" data-marker="filters-form/period"> <div class="-ermhvErgNqOfu8PwhBKw"> <span class="_2rApKSnvjmb51MvM-7gwCv" ><span class="XcPdvbPN4P4YUHpbD8YaV" ><div class="Q9t-0fZiGt8h9j2Ja1r2c form-control"> <span class="_17HmrwDBw91BjT9fujBQLV">Период</span> </div></span ></span > <div> <input type="hidden" name="createdTxtime[start]" value=""/><input type="hidden" name="createdTxtime[end]" value=""/> </div></div></div><div class="_2QFqV6aUzl8RHAlVubZgMn" data-marker="filters-form/assignee"> <div class="_1mio0PwpqByXBIUvi7-_uO form-control"> <span data-marker="select-typeahead/caret" class="caret _2PpRdomoqpBl9oP9gTYnzu" ></span ><input class="Sjmj6S2T1eedEa4o-Mc_7" type="text" name="assigneeId" data-marker="input/drop-down" value=""/> <div data-marker="select-typeahead/value" class="wo1DeikZT2ajA9Zg2W753"> <span class="tTOJkmWahiY26ixREOAX-">Исполнитель</span> </div></div></div><div class="_2QFqV6aUzl8RHAlVubZgMn" data-marker="filters-form/problem"> <div> <input type="hidden" name="problemId" readonly="" value=""/> <div class="btn-group"> <button type="button" class="multiselect btn btn-default _1ZFvlttGq7CZlA8jgkB1Ff undefined" title="Тема/Проблема" > <span>Тема/Проблема </span><b class="caret"></b> </button> <div class="dropdown-menu"></div><button type="button" class="btn btn-default _1ZFvlttGq7CZlA8jgkB1Ff undefined" > ✕ </button> </div></div></div><div class="_2QFqV6aUzl8RHAlVubZgMn" data-marker="filters-form/tags"> <div class="_1mio0PwpqByXBIUvi7-_uO form-control XJfTuShkIlMnJoT9gq70F"> <span data-marker="select-typeahead/caret" class="caret _2PpRdomoqpBl9oP9gTYnzu" ></span ><input class="Sjmj6S2T1eedEa4o-Mc_7" type="text" name="tags" data-marker="input/drop-down" value=""/> <div data-marker="select-typeahead/value" class="wo1DeikZT2ajA9Zg2W753"> <span class="AuMcPz-X-AZgj4gqrgVHe">Теги</span> </div></div></div><div class="_2QFqV6aUzl8RHAlVubZgMn" data-marker="filters-form/typeId"> <div class="_1mio0PwpqByXBIUvi7-_uO form-control"> <span data-marker="select-typeahead/caret" class="caret _2PpRdomoqpBl9oP9gTYnzu" ></span ><input class="Sjmj6S2T1eedEa4o-Mc_7" type="text" name="typeId" data-marker="input/drop-down" value=""/> <div data-marker="select-typeahead/value" class="wo1DeikZT2ajA9Zg2W753"> <span class="AuMcPz-X-AZgj4gqrgVHe">Тип тикета</span> </div></div></div><div class="_2QFqV6aUzl8RHAlVubZgMn" data-marker="filters-form/skillIds"> <div class="_1mio0PwpqByXBIUvi7-_uO form-control"> <span data-marker="select-typeahead/caret" class="caret _2PpRdomoqpBl9oP9gTYnzu" ></span ><input class="Sjmj6S2T1eedEa4o-Mc_7" type="text" name="skillIds" data-marker="input/drop-down" value=""/> <div data-marker="select-typeahead/value" class="wo1DeikZT2ajA9Zg2W753 _2auY0f0iXtY-k5s9DhhEPZ" > <span class="AuMcPz-X-AZgj4gqrgVHe">Скиллы</span> </div></div></div><div class="_2QFqV6aUzl8RHAlVubZgMn" data-marker="filters-form/channelIds"> <div class="_1mio0PwpqByXBIUvi7-_uO form-control"> <span data-marker="select-typeahead/caret" class="caret _2PpRdomoqpBl9oP9gTYnzu" ></span ><input class="Sjmj6S2T1eedEa4o-Mc_7" type="text" name="channelIds" data-marker="input/drop-down" value=""/> <div data-marker="select-typeahead/value" class="wo1DeikZT2ajA9Zg2W753"> <span class="AuMcPz-X-AZgj4gqrgVHe">Каналы</span> </div></div></div><div class="_2QFqV6aUzl8RHAlVubZgMn" data-marker="filters-form/verticalIds"> <div class="_1mio0PwpqByXBIUvi7-_uO form-control"> <span data-marker="select-typeahead/caret" class="caret _2PpRdomoqpBl9oP9gTYnzu" ></span ><input class="Sjmj6S2T1eedEa4o-Mc_7" type="text" name="verticalIds" data-marker="input/drop-down" value=""/> <div data-marker="select-typeahead/value" class="wo1DeikZT2ajA9Zg2W753"> <span class="AuMcPz-X-AZgj4gqrgVHe">Вертикали</span> </div></div></div><div class="_2QFqV6aUzl8RHAlVubZgMn _3GxV6pP6WRYE1cjl88Za9x" data-marker="filters-form/includeTest" > <label class="_3SlvWwHZieKax_tniFway4" ><input class="_2FVTCcWkr11qEo2tlPiio0" type="checkbox" name="includeTest"/>Включить тестовые</label > </div><div class="_1n1ACSwPLTzwdyiALhzHm1"> <button type="submit" class="btn btn-primary" data-marker="filters-form/submit" disabled > <i aria-hidden="true" class="glyphicon glyphicon-search"></i> Найти</button ><button type="button" class="btn btn-link" data-marker="filters-form/reset" disabled > Сбросить </button> </div></form> <div class="_1L2HBVvdGeE41Apky4n9_5"> <div class="_1QgFcq4Uf1OpB4RGKKtzMu"> <div class="btn-group btn-group-sm rpaUD_eV8E16B-yT4Pwzf" role="group"> <button type="button" title="Сменить электронную почту инициатора" class="btn btn-default" disabled > @ </button> </div><div>Найдено 0 обращений</div></div><div class="_24l2j-Ln0RO-cqsQpP9ZoJ"> <div class="helpdesk-tickets-actions-export"> <span class="pseudo-link" ><i aria-hidden="true" class="glyphicon glyphicon-file"></i> Экспорт в CSV</span > </div><div class="htVYKq9odhp9_Ggb5Dqyu _1bMr3SlBWf5d5_eQB-d_wI"></div></div></div><table class="_2jimAtSMqj2VfjjJLUY7eg"> <thead class="Nd_ryhh1ino7F6doSO3tU"> <tr> <th class="_28LUPccng9tOcQFk5Wawbe _2qOR7w7sTH9lKau0YZW7Ov coNpux6hIfoQ6jYJmzlt9" > <input type="checkbox" disabled=""/> </th> <th title="Статус" class="_28LUPccng9tOcQFk5Wawbe _2qOR7w7sTH9lKau0YZW7Ov" > С </th> <th class="_28LUPccng9tOcQFk5Wawbe">ID</th> <th class="_28LUPccng9tOcQFk5Wawbe _9n2t4nckdmsJAmMNXEN5v"> <i class="glyphicon glyphicon-paperclip"></i> </th> <th class="_28LUPccng9tOcQFk5Wawbe _9n2t4nckdmsJAmMNXEN5v">Тема</th> <th class="_28LUPccng9tOcQFk5Wawbe">Инициатор</th> <th class="_28LUPccng9tOcQFk5Wawbe">Тип</th> <th class="_28LUPccng9tOcQFk5Wawbe _2qOR7w7sTH9lKau0YZW7Ov _9n2t4nckdmsJAmMNXEN5v" > Стат. </th> <th class="_28LUPccng9tOcQFk5Wawbe">Создано</th> <th class="_28LUPccng9tOcQFk5Wawbe asc _239NJhmXLo2e3BXaEPLJ7R"> Обновлено ↑ </th> <th title="Количество комментариев" class="_28LUPccng9tOcQFk5Wawbe _2qOR7w7sTH9lKau0YZW7Ov" > <i class="glyphicon glyphicon-comment"></i> </th> <th class="_28LUPccng9tOcQFk5Wawbe">Исполнитель</th> </tr></thead> <tbody></tbody> </table> <div class="EdALCfjxnZIcmonN0mU_g _1YvtNxI6XDhZrReFXr-beR"></div></div></div></div></div><div class="_20MslagcWj3VOOOaWVcb5m" data-marker="bottom-bar"> <div class="_12YcgM10OKaqoavlrYsRQ4 ViazR5hxIRDoj5n4T-Lwk"> <div class="Y8nPNC8SmPQTZ6QoWGiod xfvAyJeA12raxS4olu2J0"> <div class="N_0UeGI7G_2aRB9yXCUXr _2Y1Yj-SVe_jCm5NgmdIO lyA4xyR1v-0faXlKwHL6c aWSkYnSPyE4FNBVPX-jfD Q2rpVHKPPyHq1yp3Ycnp1" > <span class="_1fMivT9h9aDhrEO-McVh_s" ><button class="_740mvd9eZRv1MQJV1CeHd _1ipaFNKp07cLBBhN5nhPe _32pBzHew9NxvDzwjBEKtT2 _19Ogj15NCfsKpA8eci9_8p _24NThZ2qw4p2m2xEFTZZaR" data-marker="changeStatusBtn" > <span class="_2oAj1AVfww9YDkPQ7BopK9" title="Тренажёр">Тренажёр</span> </button></span > </div><div class="N_0UeGI7G_2aRB9yXCUXr gWPB6sC3SODWLl0OVeM95 lyA4xyR1v-0faXlKwHL6c vqrEc7odOIRWwPmhg_cEv Q2rpVHKPPyHq1yp3Ycnp1" ></div><div class="N_0UeGI7G_2aRB9yXCUXr _2Y1Yj-SVe_jCm5NgmdIO lyA4xyR1v-0faXlKwHL6c SyaqLZAfm1zWDPNhh_JIT Q2rpVHKPPyHq1yp3Ycnp1" > <div class="_24QCfbNkhGekoeojaxZjUp" data-marker="agent-settings"> <a role="button" tabindex="0" class="_2aKxprjBzh57OaexjeSJX7 _2cO7yAC3VF3Sxs9eznN9em _2iswxZW6qmhHv8sZfXHH2a" data-marker="agent-settings/btn" ><svg class="kMUikIyBlIa0YK6fhEgZs" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" > <path d="M6 16h-6v-3h6v3zm-2-5v-10h-2v10h2zm-2 7v5h2v-5h-2zm13-7h-6v-3h6v3zm-2-5v-5h-2v5h2zm-2 7v10h2v-10h-2zm13 3h-6v-3h6v3zm-2-5v-10h-2v10h2zm-2 7v5h2v-5h-2z" ></path></svg ></a> </div><button class="_1ipaFNKp07cLBBhN5nhPe _32pBzHew9NxvDzwjBEKtT2 _19Ogj15NCfsKpA8eci9_8p _24NThZ2qw4p2m2xEFTZZaR" > <span class="_2oAj1AVfww9YDkPQ7BopK9" ><i aria-hidden="true" class="glyphicon glyphicon-arrow-up"></i> Наверх</span > </button> </div></div></div></div></div></div><div class="Toastify"></div><div></div></div></div></div>`
    )

    /** ФУНКЦИИ **/

    function shuffleTickets(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1))
            ;[array[i], array[j]] = [array[j], array[i]]
        }
    }
    function getAgentPermissions() {
        var url = 'https://adm.avito.ru/gwip/helpdesk/api/agent/permissions'

        var xhr = new XMLHttpRequest()
        xhr.open('POST', url)

        xhr.setRequestHeader('authority', 'adm.avito.ru')
        xhr.setRequestHeader('accept', 'application/json')
        xhr.setRequestHeader('accept-language', 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7')
        xhr.setRequestHeader('content-type', 'application/json')
        xhr.setRequestHeader('x-source', 'helpdesk-frontend')

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.responseText.indexOf('Unauthorized') > -1) {
                    Notiflix.Notify.failure('Ошибка доступа')
                    Notiflix.Report.failure(
                        'Доступ запрещён',
                        'Чтобы воспользоваться тренажёром, ты должен быть авторизован',
                        'ОК',
                        () =>
                            (window.location.href =
                                'https://adm.avito.ru/gwip/users/login?redirect_url=https://adm.avito.ru/training_beginner?')
                    )
                } else {
                    Notiflix.Notify.success('Доступ получен')
                    Notiflix.Block.remove('body', 500)
                    let agent = JSON.parse(xhr.responseText)
                    agentInfo = agent.result.name + ' (' + agent.result.email.split('@')[0] + ')'
                    $('div[id="agentLogin"]').text(agent.result.name)
                }
            }
        }

        var data = '{}'

        xhr.send(data)
    }

    function getTicketData(ticketId) {
        generateUserInfo()
        var url = 'https://adm.avito.ru/gwip/helpdesk/api/ticket/admin_get'

        var xhr = new XMLHttpRequest()
        xhr.open('POST', url)

        xhr.setRequestHeader('authority', 'adm.avito.ru')
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
                    fetch('https://mt.avito.ru/hooks/g8zb1yq6htb47nnb3g3q4kaoiw', {
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

        $('#catNPC').on('click', function (e) {
            e.preventDefault()
            $('#talkNPC').fadeIn(1000)
            if (Math.floor(Math.random() * 100) < 10) {
                $('#talkNPC').html('МАУУУУ... Лучше б ты работал, а не меня тискал')
                clearTimeout(timerChange)
                timerChange = setTimeout(updateTalkingPhrase, 15000)
            } else {
                $('#talkNPC').html(phrasesNPC[Math.floor(Math.random() * phrasesNPC.length)])
                clearTimeout(timerChange)
                timerChange = setTimeout(updateTalkingPhrase, 15000)
            }
            clearTimeout(timerFade)
            timerFade = setTimeout(() => $('#talkNPC').fadeOut(1000), 7500)
        })

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
                $('body').append(`
                <div id="NotiflixReportWrap" class="notiflix-report acquaintanceNPC" style="user-select: none; border-radius: 25px; font-family: Quicksand, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, &quot;Noto Sans&quot;, sans-serif; display: flex; flex-flow: column wrap; align-items: center; justify-content: center;"><div class="notiflix-report-overlay nx-with-animation" style="background: linear-gradient(90deg, #c7c5f4, #776bcc);animation-duration:360ms;"></div><div class="notiflix-report-content nx-with-animation  nx-fade" style="width:320px; background:#f8f8f8; animation-duration:360ms;"><div style="width:110px; height:110px;" class="notiflix-report-icon"><img src="https://support-scripts.k.avito.ru/trainingsystems/assets/ezk9INO.gif" style=""></div><h5 class="notiflix-report-title" style="font-weight:500; font-size:16px; color:#1e1e1e;padding-top: 10px;">Привет, человек!</h5><p class="notiflix-report-message" style="font-size:13px; color:#242424;text-align: justify;">Я кот, и меня зовут Вовито. Обязательно дослушай меня до конца! Сейчас мы будем с тобой решать тикеты пользователей. Нам важно научиться правильно эскалировать обращения, чтобы пользователи получали ответ вовремя. Поля, которые нам не потребуются, я скрою. Тебе лишь нужно ознакомиться с вопросом пользователя и выбрать «Скилл» и «Вертикаль», где пользователю смогут помочь. Также, пока мы с тобой вместе, тикеты после смены вертикали или программы не будут уходить от тебя. Обещаю, я их подержу за хвост. Как тикет будет готов - жми «Продолжить» в правой верхней части страницы. Время на прохождение: 15 минут.</p><a id="NXReportButton" class="notiflix-report-button closeDialogueNPC" style="font-weight:500; font-size:14px;background: #7c49ff; color:#fff;">Договорились</a></div></div>
                `)
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
                    'Не торопись',
                    'Ты не выбрал вертикаль или программу, поэтому попробуй ещё раз',
                    'Хорошо'
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
                            '"><a href="https://adm.avito.ru/helpdesk/details/' +
                            trainingTicketIds[currentTicketIndex - 1] +
                            '" target="_blank">В тикете №' +
                            currentTicketIndex +
                            '</a></b>: вопрос был безвертикальным, но DE эскалирует такие вопросы в GE. '
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
                            '"><a href="https://adm.avito.ru/helpdesk/details/' +
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
                        switch (correctVerticalId) {
                            case 1:
                                correctVerticalName = 'NotV'
                                break
                            case 2:
                                correctVerticalName = 'JO'
                                break
                            case 3:
                                correctVerticalName = 'GE'
                                break
                            case 4:
                                correctVerticalName = 'RE'
                                break
                            case 5:
                                correctVerticalName = 'SE'
                                break
                            case 6:
                                correctVerticalName = 'AUTO'
                                break
                            case 8:
                                correctVerticalName = 'Delivery'
                                break
                        }
                        mistakesLog +=
                            '<b class="tooltipped" data-position="top" data-tooltip="' +
                            $('#ticketUserMessage').html().replace(/["']/g, '') +
                            '"><a href="https://adm.avito.ru/helpdesk/details/' +
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
                    switch (correctVerticalId) {
                        case 1:
                            correctVerticalName = 'NotV'
                            break
                        case 2:
                            correctVerticalName = 'JO'
                            break
                        case 3:
                            correctVerticalName = 'GE'
                            break
                        case 4:
                            correctVerticalName = 'RE'
                            break
                        case 5:
                            correctVerticalName = 'SE'
                            break
                        case 6:
                            correctVerticalName = 'AUTO'
                            break
                        case 8:
                            correctVerticalName = 'Delivery'
                            break
                    }
                    mistakesLog +=
                        '<b class="tooltipped" data-position="top" data-tooltip="' +
                        $('#ticketUserMessage').html().replace(/["']/g, '') +
                        '"><a href="https://adm.avito.ru/helpdesk/details/' +
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

                fetch('https://mt.avito.ru/hooks/g8zb1yq6htb47nnb3g3q4kaoiw', {
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
            $('#tableVerticalTd').after(
                `<div id="tempVerticalTd" class="_13dzY8uACB9S74h6sjZXgd input-group _15DGKDgirZe-OimsdmEwtz" style="top: auto"> <div class="helpdesk-click-fog"></div><div class="_1mio0PwpqByXBIUvi7-_uO form-control _3zJmNCw_Bcbj1ZyqKYbIeg dropup _3nqF4iH6G5a4023HmiAviH"> <span data-marker="select-typeahead/caret" class="caret _2PpRdomoqpBl9oP9gTYnzu"></span ><input class="Sjmj6S2T1eedEa4o-Mc_7" type="text" name="verticalId" data-marker="input/drop-down" value="1"/> <div data-marker="select-typeahead/value" class="wo1DeikZT2ajA9Zg2W753 _12nOt91dxtkjTRQwuEq1Do"> <div> <b class="pseudo-link">Выбери вертикаль</b ><button class="close _1bxW96UFdWoDxO0KDiNcdT" type="button">×</button> </div></div><div class="_22ACja2beI7NYn8WgzGKjX"> <ul data-marker="select-typeahead/list-options" class="KBXBPm75tRR1Th6aOSMVU _2o-Bs19VxI-qUCsWbPrKn7" style="margin-top: -5px" > <li data-marker="ids-in-select(1)" data-id="1" class="Dr2a0WC8oKVjP7ZcbuPLh setTicketVertical" title="NotV" > NotV </li><li data-marker="ids-in-select(2)" data-id="2" class="Dr2a0WC8oKVjP7ZcbuPLh setTicketVertical" title="JO" > JO </li><li data-marker="ids-in-select(3)" data-id="3" class="Dr2a0WC8oKVjP7ZcbuPLh setTicketVertical" title="GE" > GE </li><li data-marker="ids-in-select(4)" data-id="4" class="Dr2a0WC8oKVjP7ZcbuPLh setTicketVertical" title="RE" > RE </li><li data-marker="ids-in-select(5)" data-id="5" class="Dr2a0WC8oKVjP7ZcbuPLh setTicketVertical" title="SE" > SE </li><li data-marker="ids-in-select(6)" data-id="6" class="Dr2a0WC8oKVjP7ZcbuPLh setTicketVertical" title="AUTO" > AUTO </li><li data-marker="ids-in-select(8)" data-id="8" class="Dr2a0WC8oKVjP7ZcbuPLh setTicketVertical" title="Delivery" > Delivery </li></ul> </div></div></div>`
            )
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
