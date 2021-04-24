let sort = {};

const dynamicSort = (property) => {
    let sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a, b) {
        /* next line works with strings and numbers, 
         * and you may want to customize it to your needs
         */
        const result = a[property].toString().localeCompare(b[property]);
        return result * sortOrder;
    }
}

const numberSort = (property) => {
    return function(a, b) { return b[property] - a[property] }
};

sort.dynamic = dynamicSort;
sort.number = numberSort;

module.exports = sort;
