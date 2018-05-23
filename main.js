'use strict';

var app = angular.module('book2pdf', ['ngSanitize', 'ngCsv']);

app.controller('pdfController', function ($scope, bookFactory, docService) {    

    $scope.tableArr = [];

    let docDefinition = {};

    const loadBookData = () => {
        bookFactory.getBook().then(data => {
            docDefinition = docService.parseDoc(data);
            $scope.tableArr = docDefinition.content[1].table.body;
        });
    };

    $scope.openPdf = () => {
        if (Object.keys(docDefinition).length !== 0) {
            pdfMake.createPdf(docDefinition).open();
            loadBookData();
        }
    };

    $scope.downloadPdf = () => {
        if (Object.keys(docDefinition).length !== 0) {
            pdfMake.createPdf(docDefinition).download('BookRollAnalytics.pdf');
            loadBookData();            
        }
    };

    $scope.reset = () => window.location.reload();

    loadBookData();

});

app.factory('bookFactory', function ($q, bookData) {
    const getBook = () => {
        return $q((resolve, reject) => {
            resolve(bookData);
        });
    };
    return { getBook };
});

app.service('docService', function () {    

    const extractBookData = (dataArr) => {
        let arr = [ [ 'Category', 'Title', 'Count', 'BookMakeup', 'ListIndex' ] ];
        let holdCategory = '';

        dataArr.forEach(row => {
            let thisCategory = '';

            if (row.Category !== thisCategory && row.Category !== holdCategory) {
                thisCategory = row.Category;
                holdCategory = thisCategory;
            }
                
            let newRow = [
                thisCategory, row.Title, row.Count, row.BookMakeup, row.ListIndex
            ];
            arr.push(newRow);
        });
        return arr;
    };

    return {
        parseDoc: (docObj) => {
            let bookDataArr = extractBookData(docObj);
            let docDefinition = { 
                content: [
                    { text: 'Health of Book Report for Book: BOOKNAME ', style: 'header' },
                    {
                        table: { body: bookDataArr }
                    }
                ]
             };
            return docDefinition;
        }
    };
});