/**
 * Created by hanjinchi on 15/6/29.
 */
let shadow = document.querySelector('#nameTag').createShadowRoot();
let template = document.querySelector('#nameTagTemplate');
shadow.appendChild(template.content);
template.remove();
