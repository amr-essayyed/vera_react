- are properties in js object ordered
# declare row cells manualy
- know the type of any select field => 'many2one'
- make it that if a field is of type <select>, it is rendered as a select

# write subtotals logic
- make setsubtotal method in the reducer.
- useEffect on any change of columns sales and quantity of the table to dispatch setsubtotal.
- add a property in the state to indicate if the field is *readonly*. 

# custom columns
- push them as hidden columns to the state.
- in edit mode show the columns that has data.

# image creation
- make image filed to dispatch the correct value to the state.
- and edit it whenever it take it back