define(["core/js/adapt", "core/js/views/componentView"], function (
  Adapt,
  ComponentView
) {
  class MoralMachineResultsView extends ComponentView {
    events() {
      return {
        "click .js-assessment-retry-btn": "onRetryClicked",
      };
    }

    preRender() {
      this.model.setLocking("_isVisible", false);
      this.listenTo(Adapt.parentView, "preRemove", function () {
        this.model.unsetLocking("_isVisible");
      });

      this.listenTo(this.model, {
        "change:_feedbackBand": this.addClassesToArticle,
        "change:body": this.render,
      });
    }
    postRender() {
      let results = this.model.getResults();
      console.log(results) 
      this.insertResults(results);
      this.model.checkIfAssessmentComplete();
      this.setReadyStatus();
      this.setupInviewCompletion(
        ".component__inner",
        this.model.checkCompletion.bind(this.model)
      )
    }

    /**
     * Resets the state of the assessment and optionally redirects the user
     * back to the assessment for another attempt.
     */
    onRetryClicked() {
      Adapt.assessment.get(state.id).reset(null, (wasReset) => {
        if (!wasReset) {
          return;
        }
        if (this.model.get("_retry")._routeToAssessment === true) {
          Adapt.navigateToElement("." + state.articleId);
        }
      });
    }
    /**
     * If there are classes specified for the feedback band, apply them to the containing article
     * This allows for custom styling based on the band the user's score falls into
     */
    addClassesToArticle(model, value) {
      if (!value || !value._classes) return;

      this.$el.parents(".article").addClass(value._classes);
    }

    insertResults(results) {
      // get getResults method from backbone model object
      console.log(results)
      // var results = this.model.getResults();
      // get results template
      let userAnswers = {
        "age-preference": {
          "Save young": 0,
          "Save old": 0,
        },
        "saving-more-lives": {
          "Save less people": 0,
          "Save more people": 0,
        },
        "gender-preference": {
          Female: 0,
          Male: 0,
        },
        "save-people-in-car": {
          "Save people in car": 0,
          "Save pedestrians": 0,
        },
        "species-preference": {
          "Save humans": 0,
          "Save animals": 0,
        },
        "upholding-the-law": {
          "Uphold Law": 0,
          "Disobey Law": 0,
        },
        "social-value-preference": {
          authority: 0,
          crime: 0,
        },
        "avoid-intervention": {
          "Avoid Intervention": 0,
          Intervene: 0,
        },
      };

      // let userResults = results.counts;
      // console.log(userResults);


      
      
      function nestedToUnestedChanges() {
        if (results.counts == undefined) {
          return;
        } else {
          // loop on the changingObj
          for (const [key1, value] of Object.entries(results.counts)) {
            // loop on the first obj for every entry of the changing obj
            for (const [key2, _] of Object.entries(userAnswers)) {
              // checking if the obj has a property of the changing obj's key
              if (userAnswers[key2].hasOwnProperty(key1)) {
                // adding the value
                userAnswers[key2][key1] += value;
              }
            }
          }
        }
        console.log(userAnswers);
      }

      try {
        nestedToUnestedChanges();
      } catch (error) {
        console.log(error);
      }
      // if both 0 delete
      const keys = Object.keys(userAnswers);
      const values = Object.values(userAnswers);

      keys.map((key) => {
        const property = userAnswers[key];
        const propertyKeys = Object.keys(userAnswers[key]);
      });

      const finalObj = {};

      let keysForView;
      let arrForBar = [];

      keys.forEach((key) => {
        const property = userAnswers[key];
        const propertyKeys = Object.keys(property);
        const hasNonZeroEntries = propertyKeys.some(
          (propertyKey) => property[propertyKey] !== 0
        );

        if (hasNonZeroEntries) {
          finalObj[key] = userAnswers[key];
        }
      });

      if (finalObj.length === 0) {
        return;
      } else {
        keysForView = Object.keys(finalObj);
        valuesForBar = Object.values(finalObj);
        valuesForBar.map((v) => {
          let total = Object.values(v)[0] + Object.values(v)[1],
            totalPercent = 100 / total,
            newCountOne = Object.values(v)[0] * totalPercent,
            newCountTwo = Object.values(v)[1] * totalPercent;

          arrForBar.push(newCountOne);
        });
      }
      
//      `
// <div id="top">
// 				<sub-section id="mostSaved" class="characters">
// 					<h1>Most Saved Character/s</h1>
// 					<img id="${results.mostSaved}" class="character" src="img/road/male.png">
// 				</sub-section>
// 				<sub-section id="mostKilled" class="characters">
// 					<h1>Most Kiled Character/s</h1>
//           <img id="${results.mostKilled}" class="character" src="img/road/male.png">
// 				</sub-section>
// 			</div>
//   `;

try {
      const preference = `<p> 
              these are your preferences: 
                most killed ${results.mostKilled}, 
                most saved: ${results.mostSaved}  
          </p>`;

      // let newValues = values.map((value) => {
      //   //       return value.toLowerCase().replace(/\s/g, '-');
      //   //     });
      let half = keysForView.length / 2,
        firstHalf = keysForView.slice(0, half),
        secondHalf = keysForView.slice(half);

      let halfRatio = arrForBar.length / 2,
        firstHalfRatio = arrForBar.slice(0, halfRatio),
        secondHalfRatio = arrForBar.slice(half, halfRatio);

      console.log(firstHalfRatio, secondHalfRatio);

      $(".moralMachineResults__container").prepend(preference);
      for (let i = 0; i < firstHalf.length; i++) {
        let leftSide = `
      <sub-section id="question-${i}">
      <h1>${firstHalf[i].replaceAll("-", " ")}</h1>
    <panel>
      <left><img width="60" height="60" src="./assets/${
        firstHalf[i]
      }_left.svg"/></left>
      <result>
      <div id="you" style="margin-left:${firstHalfRatio[i]}%">
      <div id="you-bar""></div>
      <div> You </div>
      </div>
           <div id="left"></div>
           <div id="slider"></div>
           <div id="middle"></div>
           <div id="right"></div>
        </result>
        <right><img width="60" height="60" src="./assets/${
          firstHalf[i]
        }_right.svg"/></right>
      </panel>
      </sub-section> 
      `;
        $(".left-50").append(leftSide);
      }

      for (let i = 0; i < secondHalf.length; i++) {
        let rightSide = `
        <sub-section id="question-${i}">
      <h1>${secondHalf[i].replaceAll("-", " ")}</h1>
      <panel>
        <left><img width="60" height="60" src="./assets/${
          secondHalf[i]
        }_left.svg"/></left>
        <result>
        <div id="you" style="margin-left:${secondHalfRatio[i]}%">
        <div id="you-bar""></div>
        <div> You </div>
        </div>
          <div id="left"></div>
          <div id="slider"></div>
          <div id="middle"></div>
          <div id="right"></div>
     </result>
     <right><img width="60" height="60" src="./assets/${
       secondHalf[i]
     }_right.svg"/></right>
   </panel>
      </sub-section>
      `;
        $(".right-50").append(rightSide);
      }
    } catch (error) {
      console.log(error);
    }
  }
  }

  MoralMachineResultsView.template = "assessmentResults";

  return MoralMachineResultsView;
});