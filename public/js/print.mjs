/* global TrelloPowerUp */

import { unified } from 'https://esm.sh/unified@11?bundle';
import remarkParse from 'https://esm.sh/remark-parse@11?bundle';
import remarkGfm from 'https://esm.sh/remark-gfm@4?bundle';
import remarkRehype from 'https://esm.sh/remark-rehype@11?bundle';
import rehypeStringify from 'https://esm.sh/rehype-stringify@10?bundle';
import DOMPurify from 'https://esm.sh/dompurify@3?bundle';

const Promise = TrelloPowerUp.Promise;
const t = TrelloPowerUp.iframe();

// TARGET CONTAINERS AND ELEMENTS ALREADY ADDED TO HTML
const title = document.getElementById('board-name');
const wrapper = document.getElementById('wrapper');
const mainSection = document.getElementById('lists');
const printButton = document.getElementById('print-button');
printButton.addEventListener('click', (e) => {
    e.preventDefault();
    window.print();
});
const listBoxes = document.getElementById('list-checkboxes');

const allListsBtn = document.getElementById('all-none-lists');
const allListBoxes = document.getElementsByClassName('list-select');

// REUSABLE FUNCTION TO TOGGLE CLASSNAMES, FOR HIDING/SHOWING SELECTED ELEMENTS
const toggleClassName = (selector, element, className) => {
    selector.addEventListener('change', () => {
        element.classList.toggle(className);
    });
};

// USER OPTION CHECKBOXES
const allowStyles = document.getElementById('allow-styles');
const breakLists = document.getElementById('break-lists');
const breakCards = document.getElementById('break-cards');
const filterImgs = document.getElementById('filter-images');
const cardTitles = document.getElementById('card-titles');
const cardLabels = document.getElementById('card-labels');
const cardDescs = document.getElementById('card-descs');
const lastActivity = document.getElementById('last-activity');
const dueDates = document.getElementById('due-dates');
const showMembers = document.getElementById('members');
const showAttachments = document.getElementById('attachments');
const listsOnly = document.getElementById('lists-only');

// FUNCTION CALL TO TOGGLE USER OPTIONS
toggleClassName(allowStyles, wrapper, 'no-styles');
toggleClassName(breakLists, mainSection, 'list-break');
toggleClassName(breakCards, mainSection, 'card-break');
toggleClassName(filterImgs, mainSection, 'img-filter');
// DETAILS
toggleClassName(cardTitles, mainSection, 'no-card-titles');
toggleClassName(cardLabels, mainSection, 'no-card-labels');
toggleClassName(cardDescs, mainSection, 'no-card-descs');
toggleClassName(lastActivity, mainSection, 'no-last-activity');
toggleClassName(dueDates, mainSection, 'no-due-dates');
toggleClassName(showMembers, mainSection, 'no-members');
toggleClassName(showAttachments, mainSection, 'no-attachments');
toggleClassName(listsOnly, mainSection, 'lists-only');

const allDetailsBtn = document.getElementById('all-none-details');
const allDetailBoxes = document.getElementsByClassName('detail-select');

t.render(() => {
    return Promise.all([
        t.board('name'), // board name
        t.lists('name', 'id', 'cards'), // get lists
        t.cards(
            'name',
            'id',
            'labels',
            'desc',
            'due',
            'dueComplete',
            'dateLastActivity',
            'members',
            'attachments',
            'cover',
            'checklists'
        )
    ])
        .spread((board, lists, cards) => {
            title.innerText = board.name; // add board name to the top of the page
            cards.forEach((card) => {
                console.log(card);
            });

            // iterate through each list
            lists.forEach((list) => {
                // CHECKBOXES
                // create a checkbox for each list and add the checkboxes to the top of the page
                const listName = DOMPurify.sanitize(list.name);
                const listSelect = document.createElement('span');
                const listCheckBox = document.createElement('input');
                listCheckBox.classList.add('list-select');
                listCheckBox.setAttribute('type', 'checkbox');
                listCheckBox.setAttribute('id', listName);
                listCheckBox.setAttribute('name', listName);
                listCheckBox.setAttribute('value', listName);
                listCheckBox.checked = true;
                const checkLabel = document.createElement('label');
                checkLabel.setAttribute('for', listName);
                checkLabel.innerText = listName;
                listSelect.appendChild(listCheckBox);
                listSelect.appendChild(checkLabel);
                listBoxes.appendChild(listSelect);

                // LIST CONTAINER
                const listSection = document.createElement('section');
                listSection.classList.add('list-section');
                listSection.classList.add('print');
                listSection.setAttribute('id', `${listName}-title`);
                mainSection.appendChild(listSection);
                listSection.innerHTML += `<h2 class="list-title">${listName}</h2>`;

                // call function to toggle list on/off
                const listDiv = document.getElementById(`${listName}-title`);
                toggleClassName(listCheckBox, listDiv, 'print');

                // CARD CONTAINER
                list.cards.forEach(async (card) => {
                    const cardName = DOMPurify.sanitize(card.name);
                    const cardSection = document.createElement('section');
                    cardSection.classList.add('card-section');

                    const cardTitle = document.createElement('h2');
                    cardTitle.classList.add('card-title');
                    cardTitle.innerText = cardName;

                    cardSection.appendChild(cardTitle);

                    // CARD BACKGROUND
                    // if the card cover has a background image, use it; otherwise give the color to its class list
                    if (card.cover.idUploadedBackground !== null) {
                        if (card.cover.brightness === 'dark') {
                            cardTitle.classList.add('dark-image');
                        } else {
                            cardTitle.classList.add('bright-image');
                        }
                        cardSection.setAttribute(
                            'style',
                            `background-image: url(${card.cover.sharedSourceUrl}); background-size: cover; background-repeat: no-repeat;`
                        );
                    } else {
                        cardSection.classList.add(`${card.cover.color}-card`);
                    }

                    // CARD LABELS
                    // if the card has labels, add them here
                    if (card.labels.length) {
                        const labels = document.createElement('p');
                        labels.classList.add('labels');
                        card.labels.forEach((label) => {
                            labels.innerHTML += `<span class="label ${label.color}">${label.name}</span>`; // add a class for the label's color so CSS can style it
                        });
                        cardSection.appendChild(labels);
                    }

                    // DATES SECTION
                    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                    const showDates = document.createElement('div');
                    showDates.classList.add('dates-section');

                    // LAST ACTIVITY
                    // card.dateLastActivity
                    const lastActive = document.createElement('span');
                    lastActive.classList.add('last-active');
                    const activeDate = new Date(card.dateLastActivity);
                    lastActive.innerHTML += `<i title="Last Activity" class="fa-regular fa-clock"></i> ${activeDate.toLocaleString(
                        'en-US',
                        options
                    )} at ${activeDate.toLocaleTimeString()}`;
                    showDates.appendChild(lastActive);

                    // DUE DATE
                    // card.due, card.dueComplete
                    if (card.due !== null) {
                        const dueDate = new Date(card.due);
                        const showDueDate = document.createElement('span');
                        showDueDate.classList.add('due-date');
                        showDueDate.innerHTML += `<i title="Date Due" class="fa-regular fa-bell"></i> ${dueDate.toLocaleString(
                            'en-US',
                            options
                        )} at ${dueDate.toLocaleTimeString()}`;
                        if (card.dueComplete) {
                            showDueDate.innerHTML += `<span class="due-complete"> complete <i class="fa-solid fa-check"></i></span>`;
                        } else {
                            const today = new Date();
                            if (dueDate[Symbol.toPrimitive]('number') < today[Symbol.toPrimitive]('number')) {
                                showDueDate.innerHTML += `<span class="due-overdue"> overdue <i class="fa-solid fa-triangle-exclamation"></i></span>`;
                            }
                        }
                        showDates.appendChild(showDueDate);
                    }
                    cardSection.appendChild(showDates);

                    // MEMBERS
                    // card.members []
                    if (card.members.length) {
                        const membersList = document.createElement('ul');
                        membersList.classList.add('members-list');
                        const membersTitle = document.createElement('li');
                        membersTitle.innerHTML = `<b>Members (${card.members.length}):</b>`;
                        membersList.appendChild(membersTitle);
                        card.members.forEach((member) => {
                            const memberItem = document.createElement('li');
                            memberItem.innerHTML = `<img class="member-avatar" src=${member.avatar} /> <span class="member-name">${member.fullName}</span>`;
                            membersList.appendChild(memberItem);
                        });
                        cardSection.appendChild(membersList);
                    }

                    // CARD DESC
                    // convert markdown to HTML
                    const cardDesc = await unified()
                        .use(remarkParse)
                        .use(remarkGfm)
                        .use(remarkRehype)
                        .use(rehypeStringify)
                        .process(card.desc);
                    // display the description div only if the card has a description
                    if (card.desc !== '') {
                        const sanitizedCardDesc = DOMPurify.sanitize(cardDesc);
                        cardSection.innerHTML += `<section class="card-desc">${sanitizedCardDesc}</section>`;
                    }
                    // ATTACHMENTS
                    // card.attachments []
                    if (card.attachments.length) {
                        const attachmentsDiv = document.createElement('div');
                        attachmentsDiv.classList.add('attachments');
                        attachmentsDiv.innerHTML += `<h4>Attachments (${card.attachments.length}):</h4>`;
                        const attachmentsList = document.createElement('ul');
                        card.attachments.forEach((attachment) => {
                            const attachmentName = DOMPurify.sanitize(attachment.name);
                            const attachmentUrl = DOMPurify.sanitize(attachment.url);
                            const attachmentLi = document.createElement('li');
                            attachmentLi.innerHTML = `${attachmentName}: <a href=${attachmentUrl}>${attachmentUrl}</a>`;
                            attachmentsList.appendChild(attachmentLi);
                        });
                        attachmentsDiv.appendChild(attachmentsList);
                        cardSection.appendChild(attachmentsDiv);
                    }
                    listSection.appendChild(cardSection);
                });
            });

            allListsBtn.addEventListener('click', () => {
                for (let box of allListBoxes) {
                    const matchingList = document.getElementById(`${box.id}-title`);
                    if (allListsBtn.innerText === '(select all)') {
                        matchingList.classList.add('print');
                        box.checked = true;
                    } else {
                        matchingList.classList.remove('print');
                        box.checked = false;
                    }
                }
                allListsBtn.innerText = allListsBtn.innerText === '(select all)' ? '(select none)' : '(select all)';
            });

            allDetailsBtn.addEventListener('click', () => {
                for (let box of allDetailBoxes) {
                    if (allDetailsBtn.innerText === '(select all)') {
                        mainSection.classList.remove(`no-${box.id}`);
                        box.checked = true;
                    } else {
                        mainSection.classList.add(`no-${box.id}`);
                        box.checked = false;
                    }
                }
                allDetailsBtn.innerText = allDetailsBtn.innerText === '(select all)' ? '(select none)' : '(select all)';
            });
        })
        .catch((err) => {
            console.error('Error fetching data:', err);
        });
});
