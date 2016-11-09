<%if(only){%>
it.only('<%=title%>', function() {
	<%=body%>
})
<%}else{%>
it('<%=title%>', function() {
	<%=body%>
})
<%}%>
