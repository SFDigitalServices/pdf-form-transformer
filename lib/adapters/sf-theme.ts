export const SF_GOV_THEME_PUBLIC_ID = '2fb883bc-94c7-4c86-b46b-fab8d7fd649b';

const SF_GOV_CUSTOM_CSS = `/*
SF.gov Fillout theme
*/

/************************************
Alerts/Banners
************************************/
/* alert container */
.fillout-field-alert .border-blue-400 {
  border: 1px solid #0046c2;
  border-radius: 0px;
  background-color: #e5f1ff;
  padding: 28px;
}

/* alert inner container */
.fillout-field-alert .flex.items-center .flex-col {
  flex-direction: row;
}

/* alert icon */
.fillout-field-alert .text-blue-400 {
  color: #0046c2;
}

/* alert icon placement */
.fillout-field-alert .flex.items-center {
  align-items: flex-start;
}

/* alert text */
.fillout-field-alert .ql-editor p {
  color: #0b0c0c;
  background-color: inherit;
}

/************************************
Buttons
************************************/

.fillout-field-button div {
  text-align: center;
  font-family: "Roboto Flex", sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
}

/* next/primary button */
.fillout-field-button button {
  height: 40px;
  padding: 15px 16px;
  border-radius: 4px;
  border: 1px solid #1b519e;
  background-color: #1b519e;
  box-shadow: none;
  color: #fcfcfc;

  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
}

.fillout-field-button button:hover {
  border-color: #001d4e;
  background-color: #001d4e;
}

.fillout-field-button button:focus {
  outline: 3px solid #2a60af;
  box-shadow: none;
}

/* back/secondary button */
.fillout-back-button button {
  border-radius: 4px;
  border: 1px solid #dfebfd;
  background-color: #dfebfd;
  color: #000925;
}
.fillout-back-button button:hover {
  border: 1px solid #afccf7;
  background-color: #afccf7;
}

/* button spacing */
.fillout-field-button > .justify-start {
  justify-content: space-between;
}

/************************************
Checkboxes
************************************/
.fillout-field-checkbox button,
.fillout-field-checkbox button > svg,
.fillout-field-checkboxes button,
.fillout-field-checkboxes button > svg {
  height: 40px;
  width: 40px;
}

.fillout-field-checkbox button[aria-checked="true"],
.fillout-field-checkboxes button[aria-checked="true"] {
  background-color: #386ebf;
}

.fillout-field-checkboxes fieldset {
  gap: 16px;
}

/************************************
Dropdown/select
************************************/
.react-select__indicator {
  color: #0b0c0c;
}

/************************************
Error messages
************************************/
.fillout-error-validation-message {
  color: #ac0000;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

/************************************
Navigation/progress bar
************************************/
nav .group .step-name {
  color: #0b0c0c !important;
}

/************************************
Multiple choice
************************************/
.fillout-field-multiple-choice [role="radio"] {
  margin: 16px 16px 16px 12px;
}
.fillout-field-multiple-choice span.border-2 {
  height: 40px !important;
  width: 40px !important;
}

.fillout-field-multiple-choice span.transition-transform {
  height: 22px !important;
  width: 22px !important;
  color: #386ebf !important;
}

/************************************
Spacing
************************************/
#question-alignment-container.h-full {
  height: fit-content;
}

/************************************
Text
************************************/

.fillout-field-text h1 {
  font-family: "Roboto Slab", sans-serif;
  font-style: normal;
  color: #0b0c0c;
  padding-bottom: 20px;
  font-weight: 600;
  font-size: 46px;
  line-height: 56px;
}

.fillout-field-text h2 {
  font-family: "Roboto Slab", sans-serif;
  font-style: normal;
  color: #0b0c0c;
  font-weight: 500;
  font-size: 40px;
  line-height: 52px;
}

.fillout-field-text h3 {
  font-family: "Roboto Slab", sans-serif;
  font-style: normal;
  color: #0b0c0c;
  font-weight: 600;
  font-size: 32px;
  line-height: 44px;
}

.fillout-field-text h4 {
  font-family: "Roboto Slab", sans-serif;
  font-style: normal;
  color: #0b0c0c;
  font-weight: 500;
  font-size: 24px;
  line-height: 32px;
}

.fillout-field-text h5 {
  font-family: "Roboto Slab", sans-serif;
  font-style: normal;
  color: #0b0c0c;
  font-weight: 500;
  font-size: 20px;
  line-height: 28px;
}

div,
span,
p {
  font-family: "Open Sans", sans-serif;
  font-style: normal;
}

.fillout-field-paragraph h1 {
  font-weight: 600;
  font-size: 32px;
  line-height: 44px;
}

.fillout-field-paragraph h2 {
  font-weight: 600;
  font-size: 24px;
  line-height: 32px;
}

.fillout-field-paragraph h3 {
  font-weight: 600;
  font-size: 20px;
  line-height: 28px;
}

.fillout-field-paragraph h4 {
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
}

.fillout-field-paragraph h5 {
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
}

.fillout-field-paragraph p {
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
}

.fillout-field-label p {
  color: #0b0c0c;
  font-size: 20px;
  line-height: 28px;
}

.fillout-field-container input[type],
.fillout-field-container input[placeholder],
.fillout-field-container label[type],
.fillout-field-container span[placeholder],
.fillout-field-container textarea[placeholder],
.fillout-field-multiple-choice [role="radio"] div,
.fillout-field-checkboxes label div,
.react-select__value-container .react-select__single-value {
  color: #0b0c0c !important;
}

.fillout-caption,
input::placeholder {
  color: #535454;
}

a {
  color: #2a60af;
}

.fillout-required-asterisk,
p::after {
  color: #ac0000;
}
`;

export const SF_GOV_THEME = {
  publicIdentifier: SF_GOV_THEME_PUBLIC_ID,
  name: '1. SF.gov Theme (Use me!)',
  values: {
    bold: false,
    font: { type: 'google_font', googleFont: { name: 'Roboto Slab' } },
    customCSS: SF_GOV_CUSTOM_CSS,
    formSizing: 'medium',
    answersColor: 'rgba(89, 89, 92, 1)',
    formPosition: 'default',
    primaryColor: 'rgba(27, 81, 158, 1)',
    navBarSettings: {
      type: 'image_url',
      imageUrl:
        'https://images.fillout.com/orgid-356179/flowpublicid-96oVd4FyLUus/widgetid-undefined/bJJZHLsrVEePfdpBGnE7w7/DeviceDesktop-ColorBlack(2).png?a=krg6oCqPLZXu1DSkfXkTp3',
      showLogo: true,
    },
    questionsColor: 'rgba(11, 12, 12, 1)',
    backgroundColor: 'rgba(252, 252, 252, 1)',
    containerBorder: false,
    imageBrightness: 1,
    backButtonPosition: 'near_next_button',
    verticalFieldPadding: 3.75,
    questionsBackgroundColor: 'rgba(252, 252, 252, 1)',
  },
};
