/* global TrelloPowerUp */

import { unified } from 'https://esm.sh/unified@10?bundle'
import remarkParse from 'https://cdn.skypack.dev/remark-parse@10?min'
import remarkGfm from 'https://cdn.skypack.dev/remark-gfm@3?min'
import remarkRehype from 'https://cdn.skypack.dev/remark-rehype@10?min'
import rehypeStringify from 'https://cdn.skypack.dev/rehype-stringify@9?min'

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

// REUSABLE FUNCTION TO TOGGLE CLASSNAMES, FOR HIDING/SHOWING SELECTED ELEMENTS
const toggleClassName = (selector, element, className) => {
  selector.addEventListener('change', () => {
    element.classList.toggle(className);
  })
}

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
const showMembers = document.getElementById('show-members');
const showAttachments = document.getElementById('show-attachments');
const listsOnly = document.getElementById('lists-only');

// FUNCTION CALL TO TOGGLE USER OPTIONS
toggleClassName(allowStyles, wrapper, 'no-styles');
toggleClassName(breakLists, mainSection, 'list-break');
toggleClassName(breakCards, mainSection, 'card-break');
toggleClassName(filterImgs, mainSection, 'img-filter');
toggleClassName(cardTitles, mainSection, 'no-titles');
toggleClassName(cardLabels, mainSection, 'no-labels');
toggleClassName(cardDescs, mainSection, 'no-descs');
toggleClassName(lastActivity, mainSection, 'no-last-active');
toggleClassName(dueDates, mainSection, 'no-due-dates');
toggleClassName(showMembers, mainSection, 'no-members');
toggleClassName(showAttachments, mainSection, 'no-attachments');
toggleClassName(listsOnly, mainSection, 'lists-only');

t.render(() => {
  return Promise.all([
    t.board('name'), // board name
    t.lists('name', 'id', 'cards') // get lists
  ])
    .spread((board, lists, cards) => {
      title.innerText = board.name; // add board name to the top of the page

      // iterate through each list
      lists.forEach((list) => {
        // CHECKBOXES
        // create a checkbox for each list and add the checkboxes to the top of the page
        const listSelect = document.createElement('span');
        const listCheckBox = document.createElement('input');
        listCheckBox.setAttribute('type', 'checkbox');
        listCheckBox.setAttribute('id', list.name);
        listCheckBox.setAttribute('name', list.name);
        listCheckBox.setAttribute('value', list.name);
        listCheckBox.setAttribute('checked', true);
        const checkLabel = document.createElement('label');
        checkLabel.setAttribute('for', list.name);
        checkLabel.innerText = list.name;
        listSelect.appendChild(listCheckBox);
        listSelect.appendChild(checkLabel);
        listBoxes.appendChild(listSelect);

        // LIST CONTAINER
        const listSection = document.createElement('section');
        listSection.classList.add('list-section');
        listSection.classList.add('print');
        listSection.setAttribute('id', `${list.name}-title`);
        mainSection.appendChild(listSection);
        listSection.innerHTML += `<h2 class="list-title">${list.name}</h2>`;

        // call function to toggle list on/off
        const listDiv = document.getElementById(`${list.name}-title`);
        toggleClassName(listCheckBox, listDiv, 'print');

        // CARD CONTAINER
        list.cards.forEach(async (card) => {
          const cardSection = document.createElement('section');
          cardSection.classList.add('card-section');

          const cardTitle = document.createElement('h2');
          cardTitle.classList.add('card-title');
          cardTitle.innerText = card.name;

          cardSection.appendChild(cardTitle);

          // CARD BACKGROUND
          // if the card cover has a background image, use it; otherwise give the color to its class list
          if (card.cover.idUploadedBackground !== null) {
            if (card.cover.brightness === 'dark') {
              cardTitle.classList.add('dark-image');
            } else {
              cardTitle.classList.add('bright-image');
            }
            cardSection.setAttribute('style', `background-image: url(${card.cover.sharedSourceUrl}); background-size: cover; background-repeat: no-repeat;`)
          } else {
            cardSection.classList.add(`${card.cover.color}-card`);
          }

          // CARD LABELS
          // if the card has labels, add them here
          if (card.labels.length) {
            const labels = document.createElement('p');
            labels.classList.add('labels');
            card.labels.forEach((label) => {
              labels.innerHTML += `<span class="label ${label.color}">${label.name}</span>` // add a class for the label's color so CSS can style it
            })
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
          lastActive.innerHTML += `<i title="Last Activity" class="fa-regular fa-clock"></i> ${activeDate.toLocaleString("en-US", options)} at ${activeDate.toLocaleTimeString()}`;
          showDates.appendChild(lastActive);

          // DUE DATE
          // card.due, card.dueComplete
          if (card.due !== null) {
            const dueDate = new Date(card.due);
            const showDueDate = document.createElement('span');
            showDueDate.classList.add('due-date');
            showDueDate.innerHTML += `<i title="Date Due" class="fa-regular fa-bell"></i> ${dueDate.toLocaleString("en-US", options)} at ${dueDate.toLocaleTimeString()}`;
            if (card.dueComplete) {
              showDueDate.innerHTML += `<span class="due-complete"> complete <i class="fa-solid fa-check"></i></span>`
            } else {
              const today = new Date();
              if (dueDate[Symbol.toPrimitive]('number') < today[Symbol.toPrimitive]('number')) {
                showDueDate.innerHTML += `<span class="due-overdue"> overdue <i class="fa-solid fa-triangle-exclamation"></i></span>`
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
            card.members.forEach(member => {
              const memberItem = document.createElement('li');
              memberItem.innerHTML = `<img class="member-avatar" src=${member.avatar} /> <span class="member-name">${member.fullName}</span>`;
              membersList.appendChild(memberItem);
            })
            cardSection.appendChild(membersList);
          }

          // CARD DESC
          // convert markdown to HTML
          const cardDesc = await unified().use(remarkParse)
            .use(remarkGfm)
            .use(remarkRehype)
            .use(rehypeStringify).process(card.desc);
          // display the description div only if the card has a description
          if (card.desc !== '') {
            cardSection.innerHTML += `
            <section class="card-desc">${cardDesc}</section>
        `
          }

          // ATTACHMENTS 
          // card.attachments []
          if (card.attachments.length) {
            const attachmentsDiv = document.createElement('div');
            attachmentsDiv.classList.add('attachments');
            attachmentsDiv.innerHTML += `<h4>Attachments (${card.attachments.length}):</h4>`;
            const attachmentsList = document.createElement('ul');
            card.attachments.forEach(attachment => {
              const attachmentLi = document.createElement('li');
              attachmentLi.innerHTML = `${attachment.name}: <a href=${attachment.url}>${attachment.url}</a>`;
              attachmentsList.appendChild(attachmentLi);
            })
            attachmentsDiv.appendChild(attachmentsList);
            cardSection.appendChild(attachmentsDiv);
          }
          listSection.appendChild(cardSection);
        })
      })
    })


});

