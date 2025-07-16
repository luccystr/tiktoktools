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

    let $var = {
        _altKey: false,
        shortcut_activate: false,
        fist_click: false,
        double_click_timer: undefined,

        get altKey() {
            return this._altKey;
        },

        set altKey(new_value) {
            this._altKey = new_value;
        },

        get text_box() {
            return document.querySelector(this.text_box_selector) ?? undefined;
        },

        get text_box_selector() {
            return 'div[contenteditable="plaintext-only"][placeholder^="Diga algo legal"]';
        }
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

    function waitElementAppears(selector, element = document.body, params = {childList: true, subtree: true} /*padrão*/) {
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
        console.clear();
        console.log('Comando injetado');
        // fast_type_tools
        if($var.text_box !== undefined) {
            fast_type_tool();
        } else {
            waitElementAppears($var.text_box_selector).then(response => fast_type_tool());
        }
    }
})();