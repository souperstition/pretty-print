/* global TrelloPowerUp */

import {unified} from 'https://esm.sh/unified@10?bundle'
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

const styleSelector = document.getElementById('style-selector');
const breakLists = document.getElementById('break-lists');
const breakCards = document.getElementById('break-cards');
const filterImgs = document.getElementById('filter-images');
const cardTitles = document.getElementById('card-titles');
const cardLabels = document.getElementById('card-labels');
const cardDescs = document.getElementById('card-descs');
const listsOnly = document.getElementById('lists-only');

toggleClassName(styleSelector, wrapper, 'styles');
toggleClassName(breakLists, mainSection, 'list-break');
toggleClassName(breakCards, mainSection, 'card-break');
toggleClassName(filterImgs, mainSection, 'img-filter');
toggleClassName(cardTitles, mainSection, 'no-titles');
toggleClassName(cardLabels, mainSection, 'no-labels');
toggleClassName(cardDescs, mainSection, 'no-descs');
toggleClassName(listsOnly, mainSection, 'lists-only');

t.render(() => { 
  return Promise.all([
    t.board('name'), // board name
    t.lists('name', 'id'), // get list names and ids
    t.cards('name', 'desc', 'labels', 'idList', 'cover') // get cards and desired info
  ])
  .spread((board, lists, cards) => {
    title.innerText = board.name; // add board name to the top of the page
    
    // iterate through each list
    lists.forEach((list) => {
      // CHECKBOXES
      // add the checkboxes to the top of the page
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
      
      const listDiv = document.getElementById(`${list.name}-title`);
      toggleClassName(listCheckBox, listDiv, 'print');
      
      // FILTER OUT CARDS FROM THE CURRENT LIST
      const filteredCards = cards.filter(card => {
        return card.idList === list.id
      });
      // CARD CONTAINER
      filteredCards.forEach(async (card) => {
        const cardSection = document.createElement('section');
        cardSection.classList.add('card-section');

        if (card.cover.idUploadedBackground !== null) {
          cardSection.setAttribute('style', `background-image: url(${card.cover.sharedSourceUrl}; background-repeat: no-repeat; background-size: cover)`)
        } else {
          cardSection.classList.add(`${card.cover.color}-card`);
        }
        
        cardSection.innerHTML += `<h2 class="card-title">${card.name}</h2>`;

  
        // IF THE CARD HAS LABELS, ADD THEM HERE
        if(card.labels.length) {
          const labels = document.createElement('p');
          labels.classList.add('labels');
          card.labels.forEach((label) => {
            labels.innerHTML += `<span class="label ${label.color}">${label.name}</span>` // add a class for the label's color so CSS can style it
          })
          cardSection.appendChild(labels);
        }
        
        // CONVERT MARKDOWN TO HTML
        const cardDesc = await unified().use(remarkParse)
          .use(remarkGfm)
          .use(remarkRehype)
          .use(rehypeStringify).process(card.desc);
        // DISPLAY THE DESCRIPTION SECTION ONLY IF THERE IS A CARD DESCRIPTION
        if (card.desc !== '') {
          cardSection.innerHTML += `
            <section class="card-desc">${cardDesc}</section>
        `
        }   
        listSection.appendChild(cardSection);
      })
    })
  })
  
  
});

