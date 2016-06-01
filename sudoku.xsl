<!--<?xml version="1.0" encoding="ISO-8859-1"?>-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:template match="/">
        <div id="sudoku">
        <table>

            <xsl:for-each select="/sudoku/row">
                <tr>
                    <xsl:for-each select="current()/cell">
                        <xsl:choose>
                            <xsl:when test="current() != ''">
                                <td contenteditable="false"><xsl:value-of select="current()"/></td>
                            </xsl:when>
                            <xsl:otherwise>
                                <td contenteditable="true"><xsl:value-of select="current()"/></td>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:for-each>
                </tr>
            </xsl:for-each>
        </table>
        </div>
        <div id="check-sudoku">Check it out!</div>
        <div id="submit-sudoku">Submit</div>
    </xsl:template>
</xsl:stylesheet>