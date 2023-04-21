string name = "John";
int myNum = 15;
string myText;
myText = "Hello";

var people = new Dictionary<int, string>()
{
    { 5, "Tom"},
    { 3, "Sam"},
    { 11, "Bob"}
};

var people = new Dictionary<int, string>()
{
    [5] = "Tom", // to be covered
    [6] = "Sam", // to be covered
    [7] = "Bob" // to be covered
};  


var mike = new KeyValuePair<int, string>(56, "Mike"); // to be covered
