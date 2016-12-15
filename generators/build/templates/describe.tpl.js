<%if (isTopUc) {%>
    if(preLastUcKey==null||preLastUcKey=="<%=ucKey%>"){
        preLastUcKey = null;
        describe('<%=title%>', function() {
            it('----------describeStart----------',function(){
                describeStart&&describeStart("<%=ucKey%>");
            });
            <%=body%>
        })
    }
<%}else{%>
    describe('<%=title%>', function() {
        describeStart&&describeStart("<%=ucKey%>");
        <%=body%>
    })
<%}%>
