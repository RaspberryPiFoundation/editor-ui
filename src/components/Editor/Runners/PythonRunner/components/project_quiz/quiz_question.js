export default class QuizQuestion {
  constructor(questionHTML) {
    const range = document.createRange();
    const fragment = range.createContextualFragment(questionHTML);

    const form = fragment.querySelector("form.knowledge-quiz-question");

    this.legend = form.querySelector("legend").textContent;
    this.blurbHTML = form
      .querySelector(".knowledge-quiz-question__blurb")
      .innerHTML.trim();

    this.options = {};
    form
      .querySelectorAll(".knowledge-quiz-question__answer")
      .forEach((node) => {
        const optionId = node.querySelector("input").id;
        const optionLabel = node.querySelector("label").innerHTML.trim();
        this.options[optionId] = optionLabel;
      });

    this.correctAnswerId = form.querySelector(
      'input[name="answer"][checked]'
    ).id;

    this.feedback = {};
    const r = /feedback-for-(choice-\d+)/;
    form
      .querySelectorAll(".knowledge-quiz-question__feedback-item")
      .forEach((node) => {
        const [, questionId] = node.id.match(r);
        this.feedback[questionId] = node.getElementsByTagName(
          "p"
        )[0].textContent;
      });

    form.remove();

    const introContainer = document.createElement("div");
    introContainer.appendChild(fragment.cloneNode(true));
    this.introHTML = introContainer.innerHTML.trim();
    this.hasIntro = this.introHTML.length > 0;
  }

  isCorrectAnswer(answerId) {
    return answerId === this.correctAnswerId;
  }
}
