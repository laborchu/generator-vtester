<%if (isTopUc) {%>
    if(preLastUcKey==null||preLastUcKey=="<%=ucKey%>"){
        preLastUcKey = null;
        describe('<%=title%>', function() {
            it('路由',function(){
                describeStart&&describeStart("<%=ucKey%>");
                return router(driver,"<%=winName%>");
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
