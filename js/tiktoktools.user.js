// ==UserScript==
// @name         Tik Tok Tools
// @namespace    http://tampermonkey.net/
// @version      2025-07-15
// @description  Implementação de comandos basicos para melhor utilização e moderação do chat do TikTok Web no PC!
// @author       https://x.com/luccymoony
// @match        https://www.tiktok.com/*/live*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tiktok.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    class NotifyDiv extends HTMLDivElement {
        constructor(text) {
            super();
            this.timeout = null;
            Object.assign(this.style, {
                'display'   : 'flex',
                'opacity'   : 0,
                'color' : '#fafafa',
                'overflow': 'hidden',
                'font-size' : 'large',
                'box-shadow'    : '-.5rem -.25rem .1rem #fafafa',
                'border-radius' : '.5rem',
                'user-select'   : 'none',
                'flex-wrap'     : 'wrap',
                'box-sizing'    : 'border-box',
                'background-color'  : '#0a0a0a'
            })

            const text_div = document.createElement('div');
            text_div.textContent = text;
            Object.assign(text_div.style, {
                'padding' : '.4rem 0 .4rem .6rem'
            });

            const close_btn = document.createElement('button');
            close_btn.textContent = '×';
            Object.assign(close_btn.style, {
                'width' : 'min-width',
                'color' : 'white',
                'cursor'    : 'pointer',
                'border'    : 'none',
                'font-size' : 'large',
                'padding'   : '0 .6rem',
                'background'    : 'none',
                'transition'    : '300ms'
            });

            close_btn.addEventListener('mouseover', () => close_btn.style.backgroundColor = '#ffffff50');
            close_btn.addEventListener('mouseout', () => close_btn.style.backgroundColor = '#ffffff00');
            close_btn.addEventListener('click', () => {this.remove_notification()});


            const load_bar = document.createElement('div');
            load_bar.classList.add('load_bar');
            Object.assign(load_bar.style, {
                'background-color'  : 'red',
                'flex-basis'    : '100%',
                'flex-grow' : '1',
                'height'    : '.2rem',
                'width' : '100%',
                'max-width' : '0.1%',
                'transition'    : '3000ms'
            });

            this.insertAdjacentElement('beforeend', text_div);
            this.insertAdjacentElement('beforeend', close_btn);
            this.insertAdjacentElement('beforeend', load_bar);
        }

        connectedCallback() {
            this.animate([
                {opacity: 0, transform: 'translateY(-10rem) scale(.8)'},
                {opacity: 1, transform: 'translateY(0) scale(1)'}
            ], {
                duration: 300,
                easing: 'ease-out',
                fill: 'forwards'
            }).finished
            .then(() => {
                const load = this.querySelector('.load_bar');
                load.style.maxWidth = '100%';

                return new Promise(resolve => this.timeout = setTimeout(resolve, 3000));
            })
            .then(() => this.remove_notification())
        }

        remove_notification() {
            clearTimeout(this.timeout);
            this.animate([
                {opacity: 1, transform: 'translateX(0)'},
                {opacity: 0, transform: 'translateX(-20rem)'}
            ], {
                duration: 300,
                easing: 'ease-out',
                fill: 'forwards'
            }).finished
            .then(() => this.remove());
        }
    }

    customElements.define('notify-div', NotifyDiv, {extends: 'div'});

    let $var = {
        _altKey: false,
        _shortcut_activate: false,
        first_click: false,
        double_click_timer: undefined,
        text_box_selector:'div[contenteditable="plaintext-only"][placeholder]',
        app_selector: '#app',
        notify_box_selector: '#notify_tools_box',

        get altKey() {
            return this._altKey;
        },

        set altKey(new_value) {
            this._altKey = new_value;
        },

        get shortcut_activate(){
            return this._shortcut_activate;
        },
        set shortcut_activate(new_value) {
            this._shortcut_activate = new_value;

            if(new_value === true) {
                new_notification('Os atalhos de teclado foram ativados');
            } else {
                new_notification('Os atalhos de teclado foram desativados');
            }
        },

        get text_box() {
            return document.querySelector(this.text_box_selector) ?? undefined;
        },
        
        get app() {
            return document.querySelector(this.app_selector) ?? undefined;
        },

        get notify_box() {
            return document.querySelector(this.notify_box_selector) ?? undefined;
        }
    }

    function notification_tools() {
        (function notify_box(){
            const notify_box = document.createElement('div');
            Object.assign(notify_box.style, {
                'display'   : 'flex',
                'flex-direction'    : 'column-reverse',
                'justify-content'   :'flex-end',
                'gap'   :'.5rem',
                'left'  : '0',
                'top'   : 0,
                'width' : 'max-content',
                'position'  : 'fixed',
                'max-width' : '100svw',
                'height'    : '100svh',
                'padding'   : '.5rem 0 0 .5rem',
                'align-items'   :'flex-start',
                'max-height'    : '32rem'
            });
            notify_box.id = 'notify_tools_box';

            $var.app.insertAdjacentElement('afterbegin', notify_box);
        })()

        function new_notification(text = undefined) {
            if(text === undefined) {
                console.error('Impossivel criar notificação, texto não foi definido');
                return;
            }

            if($var.notify_box === undefined) {
                console.error(`'${$var.notify_box_selector}' não foi encontrado`)
            }

            $var.notify_box.insertAdjacentElement('beforeend', new NotifyDiv(text));
        }

        window.new_notification = new_notification;
    }

    function fast_type_tool() {
        function blur_text_box() {
            if($var.text_box.innerText.trim().length === 0) {
                $var.text_box.blur();
                $var.text_box.innerText = "";
            }
        }

        function check_key(e) {
            let locked_keys = ['KeyL','KeyM','KeyP','KeyT'];
            let isLetter = e.code.length === 4 && e.code.startsWith('Key');
            let isDigit = e.code.length === 6 && e.code.startsWith('Digit');
            let isLocked = locked_keys.includes(e.code) && $var.shortcut_activate === true;

            return ((isLetter || isDigit) && !isLocked);
        }

        function onDoubleClick(callback) {
            if($var.first_click === true) {
                clearTimeout($var.double_click_timer);
                $var.first_click = false;
                callback();
            } else {
                $var.first_click = true;
                $var.double_click_timer = setTimeout(() => {
                    $var.first_click = false;
                }, 350);
            }
        }

        document.addEventListener('keydown', (e) => {
            console.log(e.code);
            if(e.code === "KeyL" && e.altKey) {
                onDoubleClick(() => {
                    if($var.shortcut_activate === true) {
                        $var.shortcut_activate = false;
                        return;
                    }
                    $var.shortcut_activate = true;
                });

                return;
            }

            if(document.activeElement === $var.text_box) {
                if(e.code === "Enter") blur_text_box();
                return;
            }

            if(check_key(e) === true) {
                $var.text_box.focus();
            }
        });

        $var.text_box.addEventListener('input', blur_text_box);
    }

    function waitElementAppears(selector, element = document.body, params = {childList: true, subtree: true}) {
        return new Promise(resolve => {
            new MutationObserver((list, obs) => {
                if(document.querySelector(selector)) {
                    resolve();
                    obs.disconnect();
                }
            }).observe(element, params);
        });
    }

    window.onload = function() {
        console.log('Comando injetado');
        // notification_tools
        if($var.app !== undefined) {
            notification_tools();
        } else {
            waitElementAppears($var.app_selector).then(response => notification_tools());
        }

        // fast_type_tools
        if($var.text_box !== undefined) {
            fast_type_tool();
        } else {
            waitElementAppears($var.text_box_selector).then(response => fast_type_tool());
        }
    }
})();