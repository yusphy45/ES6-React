/**
 * Created by hanjinchi on 15/6/29.
 */
'use strict';

var shadow = document.querySelector('#nameTag').createShadowRoot();
var template = document.querySelector('#nameTagTemplate');
shadow.appendChild(template.content);
template.remove();