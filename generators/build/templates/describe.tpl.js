<%if (isTopUc) {%>
    if(preLastUcKey==null||preLastUcKey=="<%=ucKey%>"){
        preLastUcKey = null;
        describe<%if(only){%>.only<%}%>('<%=title%>', function() {
            it('路由',function(){
                describeStart&&describeStart("<%=ucKey%>");
                return router(driver,"<%=winName%>");
            });
            <%=body%>
        })
    }
<%}else{%>
    describe<%if(only){%>.only<%}%>('<%=title%>', function() {
        <%=body%>
    })
<%}%>
