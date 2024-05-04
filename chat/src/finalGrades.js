

// 1. Get terms
const termUrl = `${baseUrl}/learn/api/public/v1/terms`
// Example response
const exampleTermsResponse = {
  "results": [
    {
      "id": "_18_1",
      "name": "2024 Spring",
      "description": "2024 Spring",
      "availability": {
        "available": "Yes",
        "duration": {
          "type": "DateRange",
          "start": "2024-05-06T07:00:00.000Z",
          "end": "2024-08-19T06:59:59.000Z"
        }
      }
    }
  ]
}

// 2. Determine current term by current date
const today = new Date();
const currentTerm = exampleTermsResponse.results.find(term => {
  const startDate = new Date(term.availability.duration.start);
  const endDate = new Date(term.availability.duration.end);
  return today >= startDate && today <= endDate;
});
const termId = currentTerm.id;

// 3. Get courses in current term
const coursesUrl = `${baseUrl}/learn/api/public/v1/courses?fields=id,courseId&termId=${termId}`
// Example response
const exampleCoursesResponse = {
  "results": [
    {
      "id": "_57_1",
      "courseId": "COM102.61.2024W.NY",
      "name": "Therapeutic Communication in Healthcare",
      "modified": "2024-04-05T01:12:31.587Z",
      "organization": false,
      "ultraStatus": "Ultra",
      "closedComplete": false,
      "termId": "_3_1",
      "availability": {
        "available": "Yes",
        "duration": {
          "type": "Term"
        }
      },
      "enrollment": {
        "type": "InstructorLed"
      },
      "locale": {
        "force": false
      },
      "externalAccessUrl": "https://learn.pacificcollege.edu/ultra/courses/_57_1/outline",
      "copyHistory": [
        {
          "uuid": "b94f51b00c3a488989eb465aa346c3c8"
        }
      ]
    }
  ]
}
const courseId = exampleCoursesResponse.results[0].id;

// Get course memberships - Not needed for this use case
// const userUrl = `${baseUrl}/learn/api/public/v1/courses/${courseId}/users?role=Student&fields=id,userId,courseRoleId,availability`
// const exampleCourseUsersResponse = {
//   "results": [
//     {
//       "id": "_780_1",
//       "userId": "_102_1",
//       "availability": {
//         "available": "Yes"
//       },
//       "courseRoleId": "Student"
//     }
//   ]
// }

// 4. Get overall grade column
const overallGradeUrl = `${baseUrl}/learn/api/public/v1/courses/${courseId}/gradebook/columns?name=Overall Grade&fields=name,id`
const overallGradeColumnResponse = {
  "results": [
    {
      "id": "_1147_1",
      "name": "Overall Grade"
    }
  ]
}
const overallColumnId = overallGradeColumnResponse.results[0].id;

// 5. Get final grade column
const finalGradeUrl = `${baseUrl}/learn/api/public/v1/courses/${courseId}/gradebook/columns?name=Final Grade&fields=name,id`
const finalGradeColumnResponse = {
  "results": [
    {
      "id": "_5839_1",
      "name": "Final Grade"
    }
  ]
}
const finalColumnId = finalGradeColumnResponse.results[0].id;

// 6. Get overall grade column for each course
const overallGradeColumnUrl = `${baseUrl}/learn/api/public/v2/courses/${courseId}/gradebook/columns/${overallColumnId}/users`
const overallGradeColumnResponse = {
  "results": [
    {
      "userId": "_223_1",
      "columnId": "_1147_1",
      "displayGrade": {
        "scaleType": "Percent",
        "score": 96.54116,
        "possible": 19.160000000000000
      },
      "exempt": false,
      "changeIndex": 0
    }
  ]
}

// 7. Get final grade column for each course
const finalGradeColumnUrl = `${baseUrl}/learn/api/public/v2/courses/${courseId}/gradebook/columns/${finalColumnId}/users`
const finalGradeColumnResponse = {
  "results": [
    {
      "userId": "_102_1",
      "columnId": "_5839_1",
      "status": "Graded",
      "displayGrade": {
        "scaleType": "Tabular",
        "score": 70.00000,
        "possible": 100.000000000000000,
        "text": "C-"
      },
      "text": "C-",
      "score": 70.00000,
      "overridden": "2024-04-01T18:11:44.745Z",
      "exempt": false,
      "changeIndex": 128935,
      "firstRelevantDate": "2024-04-01T18:11:44.745Z",
      "lastRelevantDate": "2024-04-01T18:11:44.745Z"
    }
  ]
}

// 8. Patch update Final Grade column grade for each user in course that is not in the final grade column
const finalGradeUpdateUrl = `${baseUrl}/learn/api/public/v2/courses/${courseId}/gradebook/columns/${finalColumnId}/users/${userId}`

for (const user of overallColumnResponse.results) {
  // Only patch grades not in the final grade column
  if (finalGradeColumnResponse.filter(finalGrade => finalGrade.userId === user.userId).length === 0) {
    const score = user.displayGrade.score;
    const finalGradeUpdateBody = {
      score
    }
    // Update final grade
    fetch(finalGradeUpdateUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(finalGradeUpdateBody)
    })
  }
}